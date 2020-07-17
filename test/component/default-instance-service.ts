import {
  Service, Autowired, PostConstruct, PreDestroy
} from './project-bean';

import {
  TestService
} from './test-service';

@Service()
export class DefaultInstanceService {
  @Autowired(TestService)
  private _testService!: TestService;

  constructor() {
    console.log('DefaultInstanceService: Constructor');
  }

  @PostConstruct()
  public postConstruct() {
    console.log('DefaultInstanceService: postConstruct: testService=', this._testService);
  }

  @PreDestroy()
  public preDestroy() {
    console.log('DefaultInstanceService: preDestroy');
  }
}

export default new DefaultInstanceService();
