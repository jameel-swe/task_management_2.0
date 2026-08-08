import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, In } from 'typeorm';
import { User } from '../entities';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
  findByEmail(email: string) { return this.repo.findOne({ where: { email: email.toLowerCase() } }); }
  findById(id: string) { return this.repo.findOne({ where: { id } }); }
  findByIds(ids: string[]) { return this.repo.find({ where: { id: In(ids) } }); }
  create(data: Partial<User>) { return this.repo.save(this.repo.create({ ...data, email: data.email?.toLowerCase() })); }

  /** Used by the assistant to turn human names into safe internal user IDs. */
  async findCandidates(nameOrEmail: string): Promise<User[]> {
    const value = nameOrEmail.trim();
    if (!value) return [];
    const exactEmail = await this.findByEmail(value);
    if (exactEmail) return [exactEmail];
    return this.repo.find({ where: { name: Like(`%${value}%`) }, take: 10, order: { name: 'ASC' } });
  }
}
