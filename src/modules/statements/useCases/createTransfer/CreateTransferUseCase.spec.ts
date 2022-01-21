import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

let statementsRepository: InMemoryStatementsRepository;
let createTransferUseCase: CreateTransferUseCase;
let createStatementUseCase: CreateStatementUseCase;

let user: User;
let receiver: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

describe("Create Transfer", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });

    receiver = await createUserUseCase.execute({
      name: "Receiver User",
      email: "receiver@example.com",
      password: "password",
    });

    createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a transfer between users", async () => {
    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit statement",
    });

    const transferStatement = await createTransferUseCase.execute({
      user_id: user.id as string,
      amount: 50,
      description: "Transfer statement",
      receiver_id: receiver.id as string,
    });

    const { balance: userBalance } = await statementsRepository.getUserBalance({
      user_id: user.id as string,
      with_statement: false,
    });

    const { balance: receiverBalance } =
      await statementsRepository.getUserBalance({
        user_id: receiver.id as string,
        with_statement: false,
      });

    expect(transferStatement).toHaveProperty("id");
    expect(transferStatement.amount).toBe(50);
    expect(userBalance).toBe(150);
    expect(receiverBalance).toBe(50);
  });

  it("should not be able to create a transfer between users with insufficient funds", async () => {
    await expect(
      createTransferUseCase.execute({
        user_id: user.id as string,
        amount: 5000,
        description: "Transfer statement",
        receiver_id: receiver.id as string,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a transfer to a non-existent user", async () => {
    await expect(
      createTransferUseCase.execute({
        user_id: user.id as string,
        amount: 50,
        description: "Transfer statement",
        receiver_id: "id",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a transfer from a non-existent user", async () => {
    await expect(
      createTransferUseCase.execute({
        user_id: "id-test",
        amount: 50,
        description: "Transfer statement",
        receiver_id: receiver.id as string,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
