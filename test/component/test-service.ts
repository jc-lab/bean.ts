import {
  Service,
  installer, Inject, Autowired, PostConstruct, PreDestroy
} from './project-bean';

import {
  HelloService
} from './hello-service';

console.log('===== BEGIN TestService');

@Service({
  name: 'custom-named-test'
})
export class TestService {
  @Autowired(HelloService, {lazy: true})
  private helloService!: HelloService;

  constructor() {
    console.log('TestService: Constructor');
  }

  @PostConstruct()
  public postConstruct() {
    console.log('TestService: postConstruct: helloService=', this.helloService);
  }

  @PreDestroy()
  public preDestroy() {
    console.log('TestService: preDestroy');
  }

  public add(a: number, b: number): number {
    return a + b;
  }
}
console.log('===== END TestService');

export default installer;
