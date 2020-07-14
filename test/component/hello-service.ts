import {
  installer, Service, Inject, PostConstruct, PreDestroy
} from './project-bean';

import {
  TestService 
} from './test-service';

@Service()
export class HelloService {
  public constructor(@Inject(TestService, {
    name: 'custom-named-test'
  }) private testService: TestService) {
    console.log('HelloService: Constructor');
  }

  @PostConstruct()
  protected postConstruct() {
    console.log('HelloService: postConstruct : _testService=', this.testService);
  }

  @PreDestroy()
  protected preDestroy() {
    console.log('HelloService: preDestroy');
  }
}

export default installer;

