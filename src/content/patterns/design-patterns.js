// Classic (GoF-style) software design patterns category.
// Same shape as oop.js — see that file's header comment.

export const patterns = [
  // --- Creational ---
  {
    id: "dp-singleton-py",
    name: "Singleton",
    category: "Design Patterns",
    language: "python",
    description: "Ensures a class has exactly one instance and provides a single global point of access to it.",
    code: `class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance`,
  },
  {
    id: "dp-factory-py",
    name: "Factory",
    category: "Design Patterns",
    language: "python",
    description: "Centralizes object creation behind a function so callers don't need to know which concrete class to instantiate.",
    code: `class Dog:
    def speak(self):
        return "Woof"


class Cat:
    def speak(self):
        return "Meow"


def animal_factory(kind):
    animals = {"dog": Dog, "cat": Cat}
    return animals[kind]()`,
  },
  {
    id: "dp-builder-py",
    name: "Builder",
    category: "Design Patterns",
    language: "python",
    description: "Constructs a complex object step by step, letting the caller chain configuration before producing the final result.",
    code: `class PizzaBuilder:
    def __init__(self):
        self._toppings = []

    def add_topping(self, topping):
        self._toppings.append(topping)
        return self

    def build(self):
        return Pizza(self._toppings)`,
  },
  {
    id: "dp-abstract-factory-py",
    name: "Abstract Factory",
    category: "Design Patterns",
    language: "python",
    description: "Provides an interface for creating families of related objects without specifying their concrete classes.",
    code: `class LightButton:
    def render(self):
        return "[ light button ]"


class DarkButton:
    def render(self):
        return "[ dark button ]"


class LightThemeFactory:
    def create_button(self):
        return LightButton()


class DarkThemeFactory:
    def create_button(self):
        return DarkButton()`,
  },
  {
    id: "dp-prototype-py",
    name: "Prototype",
    category: "Design Patterns",
    language: "python",
    description: "Creates new objects by copying an existing instance rather than building one from scratch.",
    code: `import copy


class Config:
    def __init__(self, settings):
        self.settings = settings

    def clone(self):
        return copy.deepcopy(self)`,
  },

  // --- Structural ---
  {
    id: "dp-decorator-py",
    name: "Decorator",
    category: "Design Patterns",
    language: "python",
    description: "Wraps a function or object to add behavior before or after the original, without modifying its source.",
    code: `def logged(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper


@logged
def add(a, b):
    return a + b`,
  },
  {
    id: "dp-adapter-py",
    name: "Adapter",
    category: "Design Patterns",
    language: "python",
    description: "Converts the interface of one class into another interface that calling code expects, letting incompatible types work together.",
    code: `class LegacyPrinter:
    def print_old(self, text):
        print(f"OLD: {text}")


class ModernPrinter:
    def __init__(self, legacy):
        self._legacy = legacy

    def print_text(self, text):
        self._legacy.print_old(text)`,
  },
  {
    id: "dp-facade-py",
    name: "Facade",
    category: "Design Patterns",
    language: "python",
    description: "Provides a simple, unified interface to a set of complex subsystems.",
    code: `class VideoConverter:
    def convert(self, filename, target_format):
        codec = self._select_codec(target_format)
        raw = self._decode(filename)
        return self._encode(raw, codec)

    def _select_codec(self, fmt):
        return "h264" if fmt == "mp4" else "vp9"

    def _decode(self, filename):
        return f"decoded:{filename}"

    def _encode(self, raw, codec):
        return f"{raw}:{codec}"`,
  },
  {
    id: "dp-proxy-py",
    name: "Proxy",
    category: "Design Patterns",
    language: "python",
    description: "Provides a stand-in for another object to control access to it, e.g. lazy loading or permission checks.",
    code: `class RealImage:
    def __init__(self, filename):
        self.filename = filename
        print(f"Loading {filename} from disk")

    def display(self):
        print(f"Displaying {self.filename}")


class ImageProxy:
    def __init__(self, filename):
        self.filename = filename
        self._real_image = None

    def display(self):
        if self._real_image is None:
            self._real_image = RealImage(self.filename)
        self._real_image.display()`,
  },

  // --- Behavioral ---
  {
    id: "dp-observer-py",
    name: "Observer",
    category: "Design Patterns",
    language: "python",
    description: "Lets subscribers register for updates from a subject, so state changes can notify many listeners without tight coupling.",
    code: `class Subject:
    def __init__(self):
        self._observers = []

    def subscribe(self, observer):
        self._observers.append(observer)

    def notify(self, event):
        for observer in self._observers:
            observer(event)`,
  },
  {
    id: "dp-strategy-py",
    name: "Strategy",
    category: "Design Patterns",
    language: "python",
    description: "Encapsulates interchangeable algorithms behind a common interface, so the behavior can be swapped at runtime.",
    code: `class Sorter:
    def __init__(self, strategy):
        self.strategy = strategy

    def sort(self, data):
        return self.strategy(data)


def ascending(data):
    return sorted(data)


def descending(data):
    return sorted(data, reverse=True)`,
  },
  {
    id: "dp-command-py",
    name: "Command",
    category: "Design Patterns",
    language: "python",
    description: "Encapsulates a request as an object, allowing actions to be queued, logged, or undone.",
    code: `class Light:
    def turn_on(self):
        print("Light on")

    def turn_off(self):
        print("Light off")


class TurnOnCommand:
    def __init__(self, light):
        self.light = light

    def execute(self):
        self.light.turn_on()`,
  },
  {
    id: "dp-state-py",
    name: "State",
    category: "Design Patterns",
    language: "python",
    description: "Lets an object change its behavior when its internal state changes, by delegating to state-specific classes.",
    code: `class DraftState:
    def publish(self, doc):
        doc.state = PublishedState()
        print("Published")


class PublishedState:
    def publish(self, doc):
        print("Already published")


class Document:
    def __init__(self):
        self.state = DraftState()

    def publish(self):
        self.state.publish(self)`,
  },
  {
    id: "dp-template-method-py",
    name: "Template Method",
    category: "Design Patterns",
    language: "python",
    description: "Defines the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the overall structure.",
    code: `class DataExporter:
    def export(self):
        data = self.fetch_data()
        formatted = self.format_data(data)
        self.save(formatted)

    def fetch_data(self):
        raise NotImplementedError

    def format_data(self, data):
        return str(data)

    def save(self, formatted):
        print(f"Saving: {formatted}")`,
  },
  {
    id: "dp-repository-py",
    name: "Repository",
    category: "Design Patterns",
    language: "python",
    description: "Hides data-source details (network, database, cache) behind a simple interface, so business logic doesn't depend on where data comes from.",
    code: `class UserRepository:
    def get_by_id(self, user_id):
        raise NotImplementedError


class ApiUserRepository(UserRepository):
    def get_by_id(self, user_id):
        response = api.get(f"/users/{user_id}")
        return User.from_json(response.body)`,
  },

  // --- Dart ---
  {
    id: "dp-builder-dart",
    name: "Builder",
    category: "Design Patterns",
    language: "dart",
    description: "Constructs a complex object step by step, letting the caller chain configuration before producing the final result.",
    code: `class PizzaBuilder {
  final List<String> _toppings = [];

  PizzaBuilder addTopping(String topping) {
    _toppings.add(topping);
    return this;
  }

  Pizza build() => Pizza(_toppings);
}

class Pizza {
  final List<String> toppings;
  Pizza(this.toppings);
}`,
  },
  {
    id: "dp-adapter-dart",
    name: "Adapter",
    category: "Design Patterns",
    language: "dart",
    description: "Converts the interface of one class into another interface that calling code expects, letting incompatible types work together.",
    code: `class LegacyPrinter {
  void printOld(String text) => print('OLD: \$text');
}

class ModernPrinter {
  final LegacyPrinter _legacy;
  ModernPrinter(this._legacy);

  void printText(String text) => _legacy.printOld(text);
}`,
  },
  {
    id: "dp-repository-dart",
    name: "Repository",
    category: "Design Patterns",
    language: "dart",
    description: "Hides data-source details (network, database, cache) behind a simple interface, so business logic doesn't depend on where data comes from.",
    code: `abstract class UserRepository {
  Future<User> getById(String id);
}

class ApiUserRepository implements UserRepository {
  @override
  Future<User> getById(String id) async {
    final res = await api.get('/users/\$id');
    return User.fromJson(res.body);
  }
}`,
  },
  {
    id: "dp-singleton-dart",
    name: "Singleton",
    category: "Design Patterns",
    language: "dart",
    description: "Ensures a class has exactly one instance, using a private constructor and a static final field.",
    code: `class AppConfig {
  AppConfig._internal();
  static final AppConfig instance = AppConfig._internal();

  String environment = 'production';
}`,
  },
  {
    id: "dp-observer-dart",
    name: "Observer",
    category: "Design Patterns",
    language: "dart",
    description: "Lets subscribers register for updates from a subject, so state changes can notify many listeners without tight coupling.",
    code: `class EventBus {
  final List<void Function(String)> _listeners = [];

  void subscribe(void Function(String) listener) {
    _listeners.add(listener);
  }

  void emit(String event) {
    for (final listener in _listeners) {
      listener(event);
    }
  }
}`,
  },
  {
    id: "dp-strategy-dart",
    name: "Strategy",
    category: "Design Patterns",
    language: "dart",
    description: "Encapsulates interchangeable algorithms behind a common function signature, so the behavior can be swapped at runtime.",
    code: `class Sorter {
  final List<int> Function(List<int>) strategy;
  Sorter(this.strategy);

  List<int> sort(List<int> data) => strategy(data);
}

List<int> ascending(List<int> data) => [...data]..sort();
List<int> descending(List<int> data) => [...data]..sort((a, b) => b - a);`,
  },
  {
    id: "dp-facade-dart",
    name: "Facade",
    category: "Design Patterns",
    language: "dart",
    description: "Provides a simple, unified interface to a set of complex subsystems.",
    code: `class VideoConverter {
  String convert(String filename, String targetFormat) {
    final codec = _selectCodec(targetFormat);
    final raw = _decode(filename);
    return _encode(raw, codec);
  }

  String _selectCodec(String fmt) => fmt == 'mp4' ? 'h264' : 'vp9';
  String _decode(String filename) => 'decoded:\$filename';
  String _encode(String raw, String codec) => '\$raw:\$codec';
}`,
  },
  {
    id: "dp-decorator-dart",
    name: "Decorator",
    category: "Design Patterns",
    language: "dart",
    description: "Wraps an object to add behavior before or after the original, without modifying its source.",
    code: `abstract class Coffee {
  double cost();
}

class SimpleCoffee implements Coffee {
  @override
  double cost() => 2.0;
}

class MilkDecorator implements Coffee {
  final Coffee coffee;
  MilkDecorator(this.coffee);

  @override
  double cost() => coffee.cost() + 0.5;
}`,
  },
  {
    id: "dp-command-dart",
    name: "Command",
    category: "Design Patterns",
    language: "dart",
    description: "Encapsulates a request as an object, allowing actions to be queued, logged, or undone.",
    code: `abstract class Command {
  void execute();
}

class Light {
  void turnOn() => print('Light on');
}

class TurnOnCommand implements Command {
  final Light light;
  TurnOnCommand(this.light);

  @override
  void execute() => light.turnOn();
}`,
  },
];
