cmake_minimum_required(VERSION 3.15)
project(Nexora CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

file(GLOB SOURCES
    src/*.cpp
    main.cpp
)

add_executable(nexora ${SOURCES})

set_target_properties(nexora PROPERTIES
    OUTPUT_NAME "nexora"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}"
)
