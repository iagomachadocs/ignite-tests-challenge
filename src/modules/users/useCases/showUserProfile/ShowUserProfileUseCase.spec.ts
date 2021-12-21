import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let createUserUseCase: CreateUserUseCase
let usersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase

describe('Show user profile', () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  })

  it('should be able to show user profile', async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@example.com",
      password: "password"
    })

    const profile = await showUserProfileUseCase.execute(user.id as string)

    expect(profile.name).toEqual("User Test")
    expect(profile.email).toEqual("user@example.com")
  })

  it('should not be able to show profile of a non-existent user', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('invalid id')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })

})