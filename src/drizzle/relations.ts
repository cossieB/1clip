import { defineRelations } from "drizzle-orm";
import * as schema from "./schema/";

export const relations = defineRelations(schema, (r) => ({
	games: {
		developer: r.one.developers({
			from: r.games.developerId,
			to: r.developers.developerId
		}),
		publisher: r.one.publishers({
			from: r.games.publisherId,
			to: r.publishers.publisherId
		}),
		platforms: r.many.platforms({
			from: r.games.gameId.through(r.gamePlatforms.gameId),
			to: r.platforms.platformId.through(r.gamePlatforms.platformId)
		}),
		genres: r.many.genres({
			from: r.games.gameId.through(r.gameGenres.gameId),
			to: r.genres.name.through(r.gameGenres.genre)
		}),
		actors: r.many.actors({
			from: r.games.gameId.through(r.gameActors.gameId),
			to: r.actors.actorId.through(r.gameActors.actorId)
		}),
		media: r.many.media({
			from: r.games.gameId,
			to: r.media.gameId
		})
	},
	posts: {
		author: r.one.users({
			from: r.posts.userId,
			to: r.users.id
		}),
		game: r.one.games({
			from: r.posts.gameId,
			to: r.games.gameId
		}),
		media: r.many.media({
			from: r.posts.postId,
			to: r.media.postId
		}),
		comments: r.many.comments({
			from: r.posts.postId,
			to: r.comments.postId
		}),
		reactions: r.many.postReactions({
			from: r.posts.postId,
			to: r.postReactions.postId
		}),
		
	},
	comments: {
		author: r.one.users({
			from: r.comments.userId,
			to: r.users.id
		}),
		originalPost: r.one.posts({
			from: r.comments.postId,
			to: r.posts.postId
		}),
		replyComment: r.one.comments({
			from: r.comments.replyTo,
			to: r.comments.commentId
		})
	}
}))