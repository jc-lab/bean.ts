import {
  installer, Model
} from './project-bean';

@Model()
export class MemberDTO {
  public name: string;
  public age: number;

  public constructor(name: string, age: number) {
    console.log('MemberDTO: Constructor');
    this.name = name;
    this.age = age;
  }

  public show() {
    console.log(`MemberDTO { name=${this.name}, age=${this.age} }`);
  }
}

export default installer;
