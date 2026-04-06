import bcrypt from 'bcryptjs'
import { UserRepository } from '../user/user.repository.js'
import { LoginInput } from './auth.schema.js'

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async authenticate(data: LoginInput) {
    const user = await this.userRepository.findByUsername(data.username)

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        stores: user.stores,
      },
    }
  }
}
