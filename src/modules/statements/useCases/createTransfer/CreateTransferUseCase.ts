import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    description,
    amount,
    receiver_id,
  }: ICreateTransferDTO): Promise<Statement> {
    const sender = await this.usersRepository.findById(user_id);

    if (!sender) {
      throw new CreateStatementError.UserNotFound();
    }

    const receiver = await this.usersRepository.findById(String(receiver_id));

    if (!receiver) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id,
    });

    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const transferOperation = await this.statementsRepository.create({
      user_id,
      type: OperationType.TRANSFER,
      amount,
      description,
      receiver_id,
    });

    return transferOperation;
  }
}
