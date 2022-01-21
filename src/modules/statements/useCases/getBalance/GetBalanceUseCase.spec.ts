import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let getBalanceUseCase: GetBalanceUseCase;

let user: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

describe("Get balance", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );

    user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });
  });

  it("should be able to get the correct balance", async () => {
    await createStatementUseCase.execute({
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

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 20,
      description: "Withdraw statement",
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response.balance).toBe(80);

    expect(response.statement[0].type).toEqual(OperationType.DEPOSIT);
    expect(response.statement[0].amount).toBe(200);

    expect(response.statement[1].type).toEqual(OperationType.WITHDRAW);
    expect(response.statement[1].amount).toBe(100);

    expect(response.statement[2].type).toEqual(OperationType.WITHDRAW);
    expect(response.statement[2].amount).toBe(20);
  });
});
