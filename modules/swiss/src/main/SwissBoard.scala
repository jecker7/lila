package lila.swiss

import scala.concurrent.duration._

import lila.common.LightUser
import lila.game.Game

private case class SwissBoard(
    gameId: Game.ID,
    white: SwissBoard.Player,
    black: SwissBoard.Player
)

private object SwissBoard {
  case class Player(user: LightUser, rank: Int, rating: Int)
  case class WithGame(board: SwissBoard, game: Game)
}

final private class SwissBoardApi(
    colls: SwissColls,
    rankingApi: SwissRankingApi,
    cacheApi: lila.memo.CacheApi,
    lightUserApi: lila.user.LightUserApi,
    gameProxyRepo: lila.round.GameProxyRepo
)(implicit ec: scala.concurrent.ExecutionContext) {

  private val displayBoards = 6

  private val boardsCache = cacheApi.scaffeine
    .expireAfterWrite(60 minutes)
    .build[Swiss.Id, List[SwissBoard]]

  def apply(id: Swiss.Id): List[SwissBoard] = ~(boardsCache getIfPresent id)

  def withGames(id: Swiss.Id): Fu[List[SwissBoard.WithGame]] =
    apply(id)
      .map { board =>
        gameProxyRepo.game(board.gameId) map2 {
          SwissBoard.WithGame(board, _)
        }
      }
      .sequenceFu
      .dmap(_.flatten)

  def update(data: SwissScoring.Result): Funit =
    data match {
      case SwissScoring.Result(swiss, players, pairings) =>
        rankingApi(swiss) map { ranks =>
          boardsCache
            .put(
              swiss.id,
              players.values.toList
                .filter(_.present)
                .sortBy(-_.score.value)
                .flatMap(player => pairings get player.number filter (_.isOngoing))
                .distinct
                .take(displayBoards)
                .flatMap { pairing =>
                  for {
                    p1 <- players get pairing.white
                    p2 <- players get pairing.black
                    u1 <- lightUserApi sync p1.userId
                    u2 <- lightUserApi sync p2.userId
                    r1 <- ranks get p1.number
                    r2 <- ranks get p2.number
                  } yield SwissBoard(
                    pairing.gameId,
                    white = SwissBoard.Player(u1, r1 + 1, p1.rating),
                    black = SwissBoard.Player(u2, r2 + 1, p2.rating)
                  )
                }
            )
        }
    }
}
