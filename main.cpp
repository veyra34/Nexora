#include <iostream>
#include <sstream>

#include "include/User.h"
#include "include/Contestant.h"
#include "include/Contest.h"
#include "include/Problem.h"
#include "include/ContestManager.h"
#include "include/Account.h"
#include "include/NexoraMember.h"
#include "include/TemplateDemo.h"
#include "include/Exceptions.h"

using namespace std;

int main()
{
    cout << "====================================\n";
    cout << "             NEXORA\n";
    cout << "====================================\n";

    Contestant contestant(
        101,
        "Riyaziya",
        "riyaziya@example.com",
        "1234",
        2);

    cout << "\n--- Contestant Profile ---\n";
    contestant.displayContestantProfile();

    cout << "\nLogin: ";

    if (contestant.login("1234"))
    {
        cout << "Successful!" << endl;
    }
    else
    {
        cout << "Failed!" << endl;
    }

    Account account(
        501,
        "riyaziya@example.com");

    cout << "\n--- Account ---\n";

    account.createAccount();

    if (account.authenticate("riyaziya@example.com"))
    {
        cout << "Authentication successful!" << endl;
    }
    else
    {
        cout << "Authentication failed!" << endl;
    }

    cout << "\n--- Friend Function Operator Overloading ---\n";

    if (contestant == account)
    {
        cout << "User and Account belong together." << endl;
    }
    else
    {
        cout << "User and Account do not match." << endl;
    }

    cout << "\n--- Static Variable & Static Function ---\n";

    cout << "Total Users Created: "
         << User::getTotalUsers()
         << endl;

    Contest contest1(
        1,
        "Codeforces Round",
        "Codeforces",
        "20:35");

    Contest contest2(
        2,
        "Weekly Coding Challenge",
        "Nexora",
        "18:00");

    ContestManager manager;

    manager.addContest(contest1);
    manager.addContest(contest2);

    manager.displayAllContests();

    cout << "\n--- Search By ID ---\n";
    manager.findContest(1);

    cout << "\n--- Search By Name ---\n";
    manager.findContest("Weekly Coding Challenge");

    Problem problem1(
        "P001",
        "ArrayPrefixSum",
        "Medium");

    Problem problem2(
        "P001",
        "ArrayPrefixSum",
        "Medium");

    cout << "\n--- Operator Overloading ---\n";

    if (problem1 == problem2)
    {
        cout << "Both problems are equal." << endl;
    }
    else
    {
        cout << "Problems are different." << endl;
    }

    cout << "\n--- Stream Operator Overloading ---\n";

    cout << problem1 << endl;

    Problem problem3(
        "",
        "",
        "");

    string input = "P003 GraphTraversal Hard";

    stringstream stream(input);

    stream >> problem3;

    cout << "\nProblem read using >> operator:\n";
    cout << problem3 << endl;

    cout << "\n--- Object Slicing ---\n";

    User slicedUser = contestant;

    cout << "Profile after slicing:\n";
    slicedUser.displayProfile();

    cout << "Contestant-specific data is not part of slicedUser." << endl;

    cout << "\n--- Pointer to Object ---\n";

    Contest *contestPtr = &contest1;

    contestPtr->displayDetails();

    cout << "\n--- Pointer to Derived Class ---\n";

    Contestant *contestantPtr = &contestant;

    contestantPtr->displayContestantProfile();

    cout << "\n--- Virtual Function ---\n";

    User *userPtr = &contestant;

    userPtr->displayProfile();

    cout << "\n--- Virtual Base Class ---\n";

    NexoraMember member(
        103,
        "Savi",
        "savi@example.com",
        "9999");

    member.displayMember();

    cout << "\n===== TYPE CASTING DEMONSTRATIONS =====\n";

    cout << "\n1. Basic-to-Class Conversion\n";

    Problem p1 = 101;
    p1.displayProblem();

    cout << "\n2. Class-to-Basic Conversion\n";

    int id = static_cast<int>(p1);

    cout << "Converted Problem ID: " << id << endl;

    cout << "\n3. Class-to-Class Conversion\n";

    Problem p2("202", "Binary Search", "Medium");

    ProblemSummary summary = static_cast<ProblemSummary>(p2);

    summary.displaySummary();

    cout << "\n===== TEMPLATE DEMONSTRATION =====\n";

    cout << "\n--- Function Template ---\n";
    displayValue(101);
    displayValue(3.14);
    displayValue("Nexora");

    cout << "\n--- Class Template ---\n";

    DataBox<int> box1(100);
    DataBox<string> box2("Nexora");
    DataBox<double> box3(9.5);

    box1.display();
    box2.display();
    box3.display();

    cout << "\n===== EXCEPTION HANDLING =====\n";

    try {
        throw runtime_error("Sample runtime error");
    }
    catch (const runtime_error& e) {
        cout << "Caught: " << e.what() << endl;
    }

    try {
        throw ContestNotFoundException();
    }
    catch (const ContestNotFoundException& e) {
        cout << "Custom exception: " << e.what() << endl;
    }

    try {
        throw InvalidContestIDException();
    }
    catch (const InvalidContestIDException& e) {
        cout << "Derived exception: " << e.what() << endl;
    }
    catch (const NexoraException& e) {
        cout << "Base exception: " << e.what() << endl;
    }

    {
        class Cleanup {
        public:
            ~Cleanup() {
                cout << "Cleanup executed." << endl;
            }
        };

        try {
            Cleanup cleanup;
            throw 10;
        }
        catch (int) {
            cout << "Exception handled." << endl;
        }
    }

    return 0;
}
