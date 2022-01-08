import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let getStatementOperationUseCase: GetStatementOperationUseCase;

let user: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get statement operation", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );

    user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });
  });

  it("should be able to get the statement operation", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit statement",
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw statement",
    });

    const responseStatement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(responseStatement.type).toEqual(OperationType.DEPOSIT);
    expect(responseStatement.amount).toBe(200);
    expect(responseStatement).toHaveProperty("id");
  });

  it("should not be able to get the statement operation with an invalid id", async () => {
    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit statement",
    });
    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "test",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should not be able to get the statement operation with an invalid user id", async () => {
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit statement",
    });

    await expect(
      getStatementOperationUseCase.execute({
        user_id: "id",
        statement_id: statement.id as string,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
});
