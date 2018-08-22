import { firebaseDb, firebaseDbFake, db, consec } from './firebase';

export class FirebaseList {

  constructor(actions, modelClass, path = null) {
    this._actions = actions;
    this._modelClass = modelClass;
    this._path = path;
    this._consec = 1;
    this._command = '';
  }

  get path() {
    return this._path;
  }

  set path(value) {
    this._path = value;
  }

  get path() {
    return this._path;
  }

  push(value) {
    return new Promise((resolve) => {
      this._command = 'push';
      db.push(value);
      firebaseDbFake.next(value);

      resolve();
    });
  }

  remove(key) {
    return new Promise((resolve) => {

      let index = db.indexOf(key);
      if (index > -1) {
        db.splice(index, 1);
      }

      resolve();
    });
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      firebaseDb.ref(`${this._path}/${key}`)
        .set(value, error => error ? reject(error) : resolve());
    });
  }

  update(key, value) {
    return new Promise((resolve) => {

      console.log('update key:', key, value);

      let index = db.map(function (e) { return e.key; }).indexOf(key);

      if (index > -1) {
        value = Object.assign(db[index], value);

        console.log('copy: ', value);


        db[index] = value;
        this._command = 'update';
        firebaseDbFake.next(value);
      }

      resolve();
    });
  }

  subscribe(emit) {

    let initialized = true;
    let list = [];

    const subscribe = firebaseDbFake.subscribe(val => {

      if (initialized) {

        switch (this._command) {
          case 'update':
            console.log('update');
            // var copy = Object.assign({}, val);
            emit(this._actions.onChange(this.unwrapSnapshotUpdate(val)));
            break;
          case 'push':
            console.log('push: ', val);
            emit(this._actions.onAdd(this.unwrapSnapshot(val)));
            break;
        }

        console.log('initialized val: ', val);
      }
      else {
        list.push(this.unwrapSnapshot(val));
        console.log('else initialized val: ', val);
      }
    });

    emit(this._actions.onLoad(list));

    // ref.once('value', () => {
    //   initialized = true;
    //   emit(this._actions.onLoad(list));
    // });

    // ref.on('child_added', snapshot => {
    //   if (initialized) {
    //     emit(this._actions.onAdd(this.unwrapSnapshot(snapshot)));
    //   }
    //   else {
    //     list.push(this.unwrapSnapshot(snapshot));
    //   }
    // });

    // ref.on('child_changed', snapshot => {
    //   emit(this._actions.onChange(this.unwrapSnapshot(snapshot)));
    // });

    // ref.on('child_removed', snapshot => {
    //   emit(this._actions.onRemove(this.unwrapSnapshot(snapshot)));
    // });

    // this._unsubscribe = () => ref.off();
  }


  unsubscribe() {
    this._unsubscribe();
  }

  unwrapSnapshot(snapshot) {

    let attrs = snapshot;

    attrs.key = this._consec++;

    let result = new this._modelClass(attrs);

    return result;
  }

  unwrapSnapshotUpdate(snapshot) {

    let attrs = snapshot;

    attrs.key = snapshot.key;

    let result = new this._modelClass(attrs);

    return result;
  }
}
