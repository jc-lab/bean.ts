import {
  installer, Controller, Inject, PostConstruct, PreDestroy, RequestMapping
} from './project-bean';

import {
  TestService 
} from './test-service';

@Controller()
export class HelloController {
  public constructor(@Inject(TestService, {
    name: 'custom-named-test'
  }) private testService: TestService) {
    console.log('HelloController: Constructor');
  }

  @PostConstruct()
  protected postConstruct() {
    console.log('HelloController: postConstruct : _testService=', this.testService);
  }

  @PreDestroy()
  protected preDestroy() {
    console.log('HelloController: preDestroy');
  }

  @RequestMapping({
    path: '/hello',
    method: 'get'
  })
  public getHello(a: number, b: number) {
    const c = this.testService.add(a, b);
    return `called hello, a=${a}, b=${b}, c=${c}`;
  }
}

export default installer;

