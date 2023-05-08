import { expect, test } from "vitest";
import { BaseObject } from "../base/BaseObject";
import { InvalidCallException } from "../base/InvalidCallException";
import { UnknownPropertyException } from "../base/UnknownPropertyException";

class User extends BaseObject {
  id = 42;
  __password = "";
  __name = "Mehdi";
  getName() {
    return this.__name;
  }
  setName(name) {
    this.__name = name;
  }
  setPassword(password) {
    this.__password = password;
  }
  getReadOnly() {
    return "can't write this";
  }
}

test("BaseObject.get", () => {
  const user = new User();

  expect(user.className()).toBe("User");
  expect(user.id).toBe(42);
  expect(user.name).toBe("Mehdi");
  expect(() => user.password).toThrowError(InvalidCallException);
  expect(() => user.unknown).toThrowError(UnknownPropertyException);
});

test("BaseObject.set", () => {
  const user = new User();

  user.password = "new password";
  user.name = "John";
  expect(user.name).toBe("John");

  expect(() => (user.readOnly = "watch this")).toThrowError(
    InvalidCallException
  );
  expect(() => (user.unknown = "foo")).toThrowError(UnknownPropertyException);
});

test("BaseObject.has", () => {
  const user = new User();

  expect("name" in user).toBe(true);
  expect("unknown" in user).toBe(false);
});

test("BaseObject.deleteProperty", () => {
  const user = new User();

  expect(delete user.name).toBe(true);
  expect(delete user.password).toBe(true);
  expect(() => delete user.readOnly).toThrow(InvalidCallException);
  expect(delete user.unknown).toBe(true);
});
