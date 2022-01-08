import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a new user with an already existing email", async () => {
    await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password",
    });

    await expect(
      createUserUseCase.execute({
        name: "Other User",
        email: "user@example.com",
        password: "1234",
      })
    ).rejects.toBeInstanceOf(CreateUserError);
  });
});
