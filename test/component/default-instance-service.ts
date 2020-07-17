import {
  Service, Autowired, PostConstruct, PreDestroy
} from './project-bean';

import {
  TestService
} from './test-service';

let constructCount = 0;

@Service()
export class DefaultInstanceService {
  @Autowired(TestService)
  private _testService!: TestService;

  public static get constructCount() {
    return constructCount;
  }

  constructor() {
    console.log('DefaultInstanceService: Constructor');
    constructCount++;
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
