// OOP fundamentals category.
// Shape: { id, name, category, language, description, code }
// `id` must be globally unique across all pattern files.
// `code` is typed as ONE continuous block (no chunking) — Patterns mode
// is deliberately "type the whole thing at once," unlike Practice/Generative.

export const patterns = [
  {
    id: "oop-encapsulation-py",
    name: "Encapsulation",
    category: "OOP Fundamentals",
    language: "python",
    description: "Bundling data and the methods that operate on it inside a class, and controlling access with a leading underscore convention or properties.",
    code: `class BankAccount:
    def __init__(self, balance):
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self._balance += amount`,
  },
  {
    id: "oop-inheritance-py",
    name: "Inheritance",
    category: "OOP Fundamentals",
    language: "python",
    description: "A subclass reuses and extends behavior from a parent class rather than duplicating it.",
    code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError


class Dog(Animal):
    def speak(self):
        return f"{self.name} says woof"`,
  },
  {
    id: "oop-polymorphism-py",
    name: "Polymorphism",
    category: "OOP Fundamentals",
    language: "python",
    description: "Different classes implement the same method name in their own way, so calling code doesn't need to know which concrete type it holds.",
    code: `class Shape:
    def area(self):
        raise NotImplementedError


class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2


class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2


def total_area(shapes):
    return sum(shape.area() for shape in shapes)`,
  },
  {
    id: "oop-abstraction-py",
    name: "Abstraction",
    category: "OOP Fundamentals",
    language: "python",
    description: "An abstract base class defines a contract without an implementation, forcing subclasses to provide their own.",
    code: `from abc import ABC, abstractmethod


class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, amount):
        pass


class CreditCard(PaymentMethod):
    def charge(self, amount):
        print(f"Charging {amount} to credit card")
        return True`,
  },
  {
    id: "oop-composition-py",
    name: "Composition over inheritance",
    category: "OOP Fundamentals",
    language: "python",
    description: "Building behavior by combining small, focused objects instead of deep inheritance chains.",
    code: `class Engine:
    def start(self):
        print("Engine starting")


class Car:
    def __init__(self, engine):
        self.engine = engine

    def start(self):
        self.engine.start()`,
  },
  {
    id: "oop-class-vs-instance-py",
    name: "Class vs. instance attributes",
    category: "OOP Fundamentals",
    language: "python",
    description: "A class attribute is shared across all instances; an instance attribute is set per object, usually in __init__.",
    code: `class Employee:
    company = "Acme Corp"

    def __init__(self, name):
        self.name = name

    def describe(self):
        return f"{self.name} works at {self.company}"`,
  },
  {
    id: "oop-dunder-methods-py",
    name: "Dunder methods (operator overloading)",
    category: "OOP Fundamentals",
    language: "python",
    description: "Implementing special methods like __eq__ and __repr__ lets custom objects work naturally with built-in operators and functions.",
    code: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"`,
  },
  {
    id: "oop-class-method-py",
    name: "Class methods as alternate constructors",
    category: "OOP Fundamentals",
    language: "python",
    description: "A classmethod can build and return an instance in a different way than __init__, often used for parsing or alternate inputs.",
    code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    @classmethod
    def from_string(cls, s):
        x, y = s.split(",")
        return cls(int(x), int(y))`,
  },
  {
    id: "oop-inheritance-dart",
    name: "Inheritance",
    category: "OOP Fundamentals",
    language: "dart",
    description: "A subclass reuses and extends behavior from a parent class using extends and super.",
    code: `class Animal {
  final String name;
  Animal(this.name);

  String speak() => '\$name makes a sound';
}

class Dog extends Animal {
  Dog(String name) : super(name);

  @override
  String speak() => '\$name says woof';
}`,
  },
  {
    id: "oop-polymorphism-dart",
    name: "Polymorphism",
    category: "OOP Fundamentals",
    language: "dart",
    description: "Different classes implement the same method in their own way, so calling code doesn't need to know the concrete type.",
    code: `abstract class Shape {
  double area();
}

class Circle extends Shape {
  final double radius;
  Circle(this.radius);

  @override
  double area() => 3.14159 * radius * radius;
}

class Square extends Shape {
  final double side;
  Square(this.side);

  @override
  double area() => side * side;
}`,
  },
  {
    id: "oop-abstraction-dart",
    name: "Abstraction",
    category: "OOP Fundamentals",
    language: "dart",
    description: "An abstract class defines a contract without an implementation, forcing subclasses to provide their own.",
    code: `abstract class PaymentMethod {
  bool charge(double amount);
}

class CreditCard extends PaymentMethod {
  @override
  bool charge(double amount) {
    print('Charging \$amount to credit card');
    return true;
  }
}`,
  },
  {
    id: "oop-composition-dart",
    name: "Composition over inheritance",
    category: "OOP Fundamentals",
    language: "dart",
    description: "Building behavior by combining small, focused objects instead of deep inheritance chains.",
    code: `class Engine {
  void start() => print('Engine starting');
}

class Car {
  final Engine engine;
  Car(this.engine);

  void start() => engine.start();
}`,
  },
  {
    id: "oop-getters-setters-dart",
    name: "Getters and setters",
    category: "OOP Fundamentals",
    language: "dart",
    description: "Custom getters and setters let you control read/write access to a field, e.g. validating on write.",
    code: `class Temperature {
  double _celsius = 0;

  double get celsius => _celsius;

  set celsius(double value) {
    if (value < -273.15) {
      throw ArgumentError('below absolute zero');
    }
    _celsius = value;
  }
}`,
  },
  {
    id: "oop-mixins-dart",
    name: "Mixins",
    category: "OOP Fundamentals",
    language: "dart",
    description: "A mixin adds reusable behavior to a class without using inheritance, via the 'with' keyword.",
    code: `mixin Loggable {
  void log(String message) => print('[LOG] \$message');
}

class Service with Loggable {
  void run() {
    log('Service started');
  }
}`,
  },
  {
    id: "oop-interfaces-dart",
    name: "Implicit interfaces",
    category: "OOP Fundamentals",
    language: "dart",
    description: "Every Dart class implicitly defines an interface; 'implements' lets another class satisfy that interface without inheriting its code.",
    code: `class Printer {
  void printData(String data) => print(data);
}

class MockPrinter implements Printer {
  final List<String> logs = [];

  @override
  void printData(String data) {
    logs.add(data);
  }
}`,
  },
  {
    id: "oop-factory-constructor-dart",
    name: "Factory constructors",
    category: "OOP Fundamentals",
    language: "dart",
    description: "A factory constructor can return a cached instance or a subtype instead of always creating a new object.",
    code: `class Logger {
  static final Map<String, Logger> _cache = {};
  final String name;

  factory Logger(String name) {
    return _cache.putIfAbsent(name, () => Logger._internal(name));
  }

  Logger._internal(this.name);
}`,
  },
];
