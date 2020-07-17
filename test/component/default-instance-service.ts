import {
  Service,
  installer, Inject, Autowired, PostConstruct, PreDestroy
} from './project-bean';

import {
  TestService
} from './test-service';

@Service()
export class OldTypeService {
  constructor(@Inject(TestService) private _testService: TestService) {
    console.log('OldTypeService: Constructor: testService=', this._testService);
  }

  @PostConstruct()
  public postConstruct() {
    console.log('OldTypeService: postConstruct');
  }

  @PreDestroy()
  public preDestroy() {
    console.log('OldTypeService: preDestroy');
  }
}

const INSTANCE = new TestService();
export default INSTANCE;
