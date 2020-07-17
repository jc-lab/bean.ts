import {
  BeanFactory
} from './bean-factory';
import {
  S_ModuleInstall, getBeanDefinitionsFromModule
} from './intl';

function install(mod: any) {
  getBeanDefinitionsFromModule(mod)
    .forEach(item => {
      item.beanDefinition.context[S_ModuleInstall](
        item.beanDefinition, item.target
      );
    });
}

export * from './types';
export {BeanFactory,
  install};
