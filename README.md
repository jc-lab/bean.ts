# bean.ts

AOP support using a typescript decorator. You can implement the MVC pattern via bean.ts.

See test code.

```typescript
import {
  installer, Controller, Inject, PostConstruct, PreDestroy, RequestMapping
} from './project-bean';

import {
  MemberService 
} from './member-service';

@Controller()
export class MemberController {
  public constructor(@Inject(MemberService) private memberService: MemberService) {
    console.log('MemberController: Constructor');
  }

  @PostConstruct()
  protected postConstruct() {
    console.log('MemberController: postConstruct : _memberService=', this.memberService);
  }

  @PreDestroy()
  protected preDestroy() {
    console.log('MemberController: preDestroy');
  }

  @RequestMapping({
    path: '/member/users',
    method: 'get'
  })
  public getUsers(a: number, b: number) {
    return `called get users, a=${a}, b=${b}`;
  }

  @RequestMapping({
    path: '/member/users',
    method: 'post'
  })
  public postUsers(a: number, b: number) {
    return `called post users, a=${a}, b=${b}`;
  }
}

export default installer;
```

## License

Apache-2.0
