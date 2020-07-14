import {
  installer, Service, Inject, PostConstruct, PreDestroy
} from './project-bean';

import {
  MemberDTO
} from './member-model';

import {
  TestService
} from './test-service';
import {
  HelloService
} from './hello-service';

@Service()
export class MemberService {
  private _members: MemberDTO[];

  public constructor(
    @Inject(TestService, {
      name: 'custom-named-test'
    })
    private _testService: TestService,
    @Inject(HelloService) private _helloService: HelloService
  ) {
    this._members = [];
  }

  @PostConstruct()
  protected postConstruct() {
    console.log('MemberService: postConstruct : _testService=', this._testService);
    console.log('MemberService: postConstruct : _helloService=', this._helloService);
  }

  @PreDestroy()
  protected preDestroy() {
    console.log('MemberService: preDestroy');
  }

  public save(member: MemberDTO) {
    this._members.push(member);
  }

  public showAll() {
    this._members.forEach(v => v.show());
  }
}

export default installer;

