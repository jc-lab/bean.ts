import {
  Service, Controller,
  installer, Inject, Autowired, PostConstruct, PreDestroy
} from './project-bean';

console.log('===== BEGIN StangerComponent');

@Service()
@Controller()
export class StangerComponent {
  constructor() {
    console.log('StangerComponent: Constructor');
  }

  @PostConstruct()
  public postConstruct() {
    console.log('StangerComponent: postConstruct');
  }

  @PreDestroy()
  public preDestroy() {
    console.log('StangerComponent: preDestroy');
  }

  public add(a: number, b: number): number {
    return a + b;
  }
}
console.log('===== END StangerComponent');

export default installer;
