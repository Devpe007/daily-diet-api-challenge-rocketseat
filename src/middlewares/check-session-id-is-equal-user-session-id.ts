import { FastifyReply, FastifyRequest } from "fastify";
import { knex } from "../database/config";

export async function checkSessionIdIsEqualUserSessionId(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.cookies

  const [user] = await knex('users')
    .where({ session_id: sessionId })

  if (user.session_id !== sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized.'
    })
  }
}
