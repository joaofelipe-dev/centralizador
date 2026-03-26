import bcrypt from 'bcryptjs'
import { UserRepository } from './user.repository.js'
import { CreateUserInput, UpdateUserInput } from './user.schema.js'

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: CreateUserInput) {
    const userAlreadyExists = await this.userRepository.findByUsername(data.username)

    if (userAlreadyExists) {
      throw new Error('Username already exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    return this.userRepository.create({
      ...data,
      password: hashedPassword,
    })
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  async listUsers() {
    return this.userRepository.list()
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new Error('User not found')
    }

    if (data.username) {
      const usernameConflict = await this.userRepository.findByUsername(data.username)
      if (usernameConflict && usernameConflict.id !== id) {
        throw new Error('Username already in use')
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    return this.userRepository.update(id, data)
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new Error('User not found')
    }

    return this.userRepository.delete(id)
  }
}
