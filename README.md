# A+ Web IDE

A react frontend and IDE for A+.

## Running project

### Run the backend

1. Clone dev version of [mooc-grader](https://github.com/ihalaij1/mooc-grader/tree/api-feedback-json)
    1. `git checkout api-feedback-json`
2. Clone dev version of [a-plus](https://github.com/ihalaij1/a-plus/tree/api-feedback-json)
    1. `git checkout api-feedback-json`
3. Clone [Aplus manual](https://github.com/apluslms/aplus-manual)

    1. Edit `docker-compose.yml`

        ```yaml
        grader:
            image: apluslms/run-mooc-grader:1.19
            volumes:
                # ...
                - path/to/mooc-grader:/srv/grader/ # <--- Add this
            # ...
        plus:
            image: apluslms/run-aplus-front:1.19
            volumes:
                # ...
                - path/to/a-plus:/src/aplus/:ro # <--- Add this
            # ...
        ```

    2. Run the manual by following the instructions provided in its `README.md`.

### Run the frontend

Install packages

```
npm i
```

Run the project

```
npm run dev
```
