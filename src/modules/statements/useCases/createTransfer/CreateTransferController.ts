import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateTransferUseCase } from "./CreateTransferUseCase";

export class CreateTransferController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { receiver_id } = request.params;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const statement = await createTransferUseCase.execute({
      user_id,
      amount,
      description,
      receiver_id,
    });

    return response.status(201).json(statement);
  }
}
