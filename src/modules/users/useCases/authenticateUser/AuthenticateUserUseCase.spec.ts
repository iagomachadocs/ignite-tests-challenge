import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should authenticate an existing user", async () => {
    await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });

    const auth = await authenticateUserUseCase.execute({
      email: "user@example.com",
      password: "password",
    });

    expect(auth).toHaveProperty("token");
  });

  it("should not authenticate an user with wrong password", async () => {
    await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });

    await expect(
      authenticateUserUseCase.execute({
        email: "user@example.com",
        password: "1234",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not authenticate a non-existent user", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "user@test.com",
        password: "1234",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
