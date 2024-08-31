import { FastifyInstance } from "fastify";
import { knex } from "../database/config";
import { z } from "zod";
import crypto from "node:crypto";

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email()
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('users')
      .insert({
        id: crypto.randomUUID(),
        name,
        email,
        session_id: sessionId
      })

    return reply.status(201).send()
  })
}
