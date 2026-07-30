import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}
  findByEmail(email: string) { return this.repo.findOne({ where: { email: email.toLowerCase() } }); }
  findById(id: string) { return this.repo.findOne({ where: { id } }); }
  findByIds(ids: string[]) { return this.repo.find({ where: { id: In(ids) } }); }
  create(data: Partial<User>) { return this.repo.save(this.repo.create({ ...data, email: data.email?.toLowerCase() })); }
}
