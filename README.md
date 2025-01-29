# Docker Cloud Build

Docker Cloud Build is a GitHub Action that can be used to build Docker images using Google Cloud Storage, Google Cloud
Build and Google Artifact Registry. It also has some more features:

- Build images for commits and tags
- Include files by specifying wildcard patterns
- Custom image tag format using branch name, hash, date, and time
- Add more tags such as latest, branch-latest or custom constants

## Usage

Just include the action in your workflow like this:

```yaml
- name: Build Docker Image
  uses: Miragon/docker-cloud-build@v2.0.0
  with:
    gcp-project-id: my-project-id
    gcp-service-account-key: ${{ secrets.GCP_SA_KEY }}
    gcp-registry-repository: my-repository
    image-name: my-image-name
    image-sources: build/libs/*.jar,Dockerfile,some-other-file
```

## Configuration

The action can be configured by specifying several configuration options that are described in detail in the following
paragraphs.

### Configuring GCP

To use Google Cloud services such as Cloud Build, Cloud Storage, or Artifact Registry, you first have to configure
this action. You can use the following options.

| Option                     | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `gcp-project-id`           | **Required.** The project ID to use for all GCP services.                                                                                                                                                                                                                                                                                                                                                                                |
| `gcp-service-account-key`  | **Required.** The content of the service account JSON file to <br> use for authentication.                                                                                                                                                                                                                                                                                                                                               |
| `gcp-cloud-storage-bucket` | The Cloud Storage bucket to use to temporarily store the <br> Cloud Build input files. By default, a bucket with the name <br> `${projectId}_cloudbuild` will be used. The uploaded <br> files will be deleted after the build has finished. <br><br> **You have to create the specified bucket first manually.**                                                                                                                        |
| `gcp-registry-use-gcr`     | Enables support for former Google Container Registry <br> repositories migrated to Google Artifact Registry.                                                                                                                                                                                                                                                                                                                             |
| `gcp-registry-host`        | The host to use for Google Artifact Registry. Find all <br> supported values [in the GCP documentation](https://cloud.google.com/artifact-registry/docs/repositories/repo-locations). The default <br> value is `europe.pkg.dev`. <br><br> If you want to use a former GCR repository, this value <br> must be set to one of the GCR endpoints (e.g. `eu.gcr.io`).                                                                       |
| `gcp-registry-repository`  | **Required unless you use GCR.** <br> The repository to use for Google Artifact Registry. <br><br> **You have to create the specified repository first manually.** <br><br>If you want to use a former GCR repository, you can omit this <br> value. The `gcp-project-id` will be used instead. If you <br> want to use a repository in another project, you can still use <br> this parameter to override the project ID default value. |

### Support for former Google Container Registry repositories

Google Container Registry is deprecated and is replaced by Google Artifact Registry. However, we still support gcr.io
repositories that have been migrated to Google Artifact Registry. In order for this to work, you have to follow these steps:

1. Set the value `gcp-registry-use-gcr` to `true`.
2. Set the value `gcp-registry-host` to the GCR endpoint that you want to use (e.g. `eu.gcr.io`).
3. Omit the value `gcp-registry-repository` unless you want to use a repository in another project.

### Building the image

To build the image successfully, you have to specify at least these options.

| Option          | Meaning                                                                                                                                                                                                                                                                                                                                                             |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `image-name`    | **Required.** The name of the image to build.                                                                                                                                                                                                                                                                                                                       |
| `image-sources` | **Required.** The sources to use to build the image. <br><br> You can include any source files that are within your GitHub workspace, <br> such as build artifacts or Dockerfiles. The option also supports globstar <br> wildcards such as `?`, `*`, `**`, or `[...]`. Read [this](https://github.com/actions/toolkit/tree/master/packages/glob) for more details. |

### Tagging the image

If the build is caused by a commit, the image will by default be tagged with branch, commit hash, and date. If it is
caused by a tag, the tag name is used instead. You can customize the tags that are applied to your image by specifying
these options.

| Option                      | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `image-tag-latest`          | Set this to `true` to add the `latest` tag to the image.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `image-tag-branch-latest`   | Set this to `true` to add the `${branch}-latest` tag to <br> the image.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `image-tag-additional-tags` | Set this to a comma-separated list of values to specify <br> additional tags.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `image-tag-format`          | Specify the format of the default tag if it is caused by <br> a commit. You can use the following placeholders:<pre>$BRANCH     The branch name, normalized.<br>$SHA        The 7-digit SHA of the commit<br>$YYYY       The year in 4-digit format<br>$MM         The month in 2-digit format<br>$DD         The day in 2-digit format<br>$HH         The hour in 2-digit format (24h)<br>$mm         The minute in 2-digit-format<br>$SS         The second in 2-digit-format</pre> Default: `$BRANCH-$SHA-$YYYY.$MM.$DD-$HH.$mm.$SS`. |

## Example

This is an example for a GitHub Action workflow that uses this action and specifies all possible options (that are not
exclusive to each other). You need to adapt it to your own requirements first.

```yaml
name: Build Docker Image

on:
  push: # Listen to commits
  release:
    types:
      - published # Listen to releases (you can't listen to tags directly)

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Sources
        uses: actions/checkout@v4

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          java-version: 17

      - name: Build Application
        run: # Build your application here, e.g.: ./gradlew build

      - name: Build Docker Image
        uses: Miragon/docker-cloud-build@v2.0.0
        with:
          gcp-project-id: my-project-id
          gcp-service-account-key: my-service-account-key
          gcp-cloud-storage-bucket: my-project-id_cloudbuild      # Default value
          gcp-registry-host: europe.pkg.dev                       # Default value
          gcp-registry-repository: my-repository
          image-name: my-image
          image-sources: build/libs/*.jar,Dockerfile
          image-tag-format: $BRANCH-$SHA-$YYYY$MM$DD-$HH$mm$SS    # Optional
          image-tag-latest: true                                  # Optional
          image-tag-branch-latest: true                           # Optional
          image-tag-additional-tags: tag1,tag2,tag3               # Optional
```

## Contributing

We are always welcoming new contributors that are helping to improve this action.

The [Open Source Guides](https://opensource.guide/) website has a lot of information for people and companies who are
interested in how to run and contribute to an open source project. Contributors and people new to open source will find
[this guide on how to contribute to Open Source](https://opensource.guide/how-to-contribute/) especially helpful.

There are many ways in which you can contribute to this repository, and not all of them require you to write code:

- **Use the action!** Test the action, check if edge cases are breaking them, and open issues if anything does not work
  as expected or could be improved. Send us your feedback.
- **Read our documentation.** Is everything covered or are there any missing parts? Is there anything left unclear?
  Open an issue if anything is missing or wrong.
- **Check our open issues.** If there is any issue you would like to work on, feel free to fork the repository and
  submit a pull request. If you need help, let us know, we're here to help.

## Development Notice

To create a new release, use the task `yarn dist`. It runs ESLint, clears the cache, and creates a distributable build
including all required dependencies using @vercel/ncc.

## License

Distributed under the Apache 2.0 License.

```
Copyright 2025 Miragon GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
