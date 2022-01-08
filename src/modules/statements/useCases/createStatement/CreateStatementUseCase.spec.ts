import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let user: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create statement", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit statement", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit statement",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toEqual(user.id);
  });

  it("should be able to create a withdraw statement", async () => {
    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit statement",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw statement",
    });

    expect(statement).toHaveProperty("id");
    expect(statement.user_id).toEqual(user.id);
  });

  it("should not be able to create a withdraw statement without funds", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Withdraw statement",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a statement of a non-existent user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "invalid id",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "Deposit statement",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
