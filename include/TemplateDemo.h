#ifndef TEMPLATEDEMO_H
#define TEMPLATEDEMO_H

#include <iostream>
using namespace std;

template <typename T>
void displayValue(T value) {
cout << "Value: " << value << endl;
}

template <typename T>
class DataBox {
private:
T value;

public:
DataBox(T v) {
value = v;
}

T getValue() const {
    return value;
}

void display() const {
    cout << "Stored value: " << value << endl;
}

};

#endif
