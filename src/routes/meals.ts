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

    let sessionId = request.cookies.sessionId

    await knex('meals').insert({
      id: crypto.randomUUID(),
      name,
      description,
      in_diet,
      session_id: sessionId
    })

    return reply.status(201).send()
  })

  app.get('/', {
    preHandler: [checkSessionIdExists],
  }, async (request, reply) => {
    const meals = await knex('meals').select()

    return {
      meals,
    }
  })

  app.get('/:id', {
    preHandler: [checkSessionIdExists],
  }, async (request) => {
    const { sessionId } = request.cookies

    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        session_id: sessionId,
        id,
      })
      .first()

    return {
      meal
    }
  })

  app.put('/:id', {
    preHandler: [checkSessionIdExists],
  }, async (request, reply) => {
    const getMealIdParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateMealBodyShema = z.object({
      name: z.string(),
      description: z.string(),
      in_diet: z.boolean(),
    })

    const { id } = getMealIdParamsSchema.parse(request.params)
    const { name, description, in_diet } = updateMealBodyShema.parse(request.body)

    await knex('meals').update({
      name,
      description,
      in_diet
    }).where({
      id
    })

    return reply.status(200).send()
  })

  app.delete('/:id', {
    preHandler: [checkSessionIdExists],
  }, async (request, reply) => {
    const { sessionId } = request.cookies

    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    await knex('meals')
      .where({
        session_id: sessionId,
        id,
      })
      .del()

    return reply.status(200).send()
  })
}
