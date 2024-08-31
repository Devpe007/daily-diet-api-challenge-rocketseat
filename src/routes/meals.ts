import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database/config";
import crypto from 'node:crypto'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', {
    preHandler: [checkSessionIdExists],
  }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      in_diet: z.boolean()
    })

    const { name, description, in_diet } = createMealBodySchema.parse(request.body)

    const meal = await knex('meals').insert({
      id: crypto.randomUUID(),
      name,
      description,
      in_diet
    })

    return reply.status(201).send()
  })
}
