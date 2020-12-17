export interface TypedKeyBase {
  type: string;
  key: any;
}

export interface IHolder<V> {
  keys: TypedKeyBase[];
  value: V;
}

export default class TypedKeyMap<TypedKey extends TypedKeyBase, V> {
  private _keymap: Record<string, Record<any, IHolder<V>>> = {};

  public getHolder(typedKey: TypedKey): IHolder<V> | undefined {
    const firstMap = this._keymap[typedKey.type];
    if (!firstMap) return undefined;
    return firstMap[typedKey.key];
  }

  public get(typedKey: TypedKey): V | undefined {
    const holder = this.getHolder(typedKey);
    return holder && holder.value;
  }

  public has(typedKey: TypedKey): boolean {
    const firstMap = this._keymap[typedKey.type];
    if (!firstMap) return false;
    return typedKey.key in firstMap;
  }

  public put(keys: TypedKey[], value: V) {
    const holder: IHolder<V> = {
      keys, value
    };
    keys.forEach((typedKey) => {
      let firstMap = this._keymap[typedKey.type];
      if (!firstMap) {
        firstMap = {};
        this._keymap[typedKey.type] = firstMap;
      }
      firstMap[typedKey.key] = holder;
    });
  }

  public remove(typedKey: TypedKey): V | undefined {
    const firstMap = this._keymap[typedKey.type];
    if (!firstMap) return undefined;
    const holder = firstMap[typedKey.key];
    if (holder) {
      holder.keys.forEach(item => {
        const map = this._keymap[item.type];
        if (map) {
          delete map[item.key];
          if (!Object.keys(map).length) {
            delete this._keymap[item.type];
          }
        }
      });
    }
  }
}
