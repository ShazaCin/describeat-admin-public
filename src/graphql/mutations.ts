function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
}

export const createShazacinMetadataAdTracks = /* GraphQL */ gql`
  mutation CreateShazacinMetadataAdTracks(
    $input: CreateShazacinMetadataAdTracksInput!
  ) {
    createShazacinMetadataAdTracks(input: $input) {
      titleId
      trackId
      name
      narratedLanguage
      narrator
      trackUrl
      trackPosition
      publicEnabled
      releaseDate
      magic_adjust
      createdAt
    }
  }
`;

export const updateShazacinMetadataAdTracks = /* GraphQL */ gql`
  mutation UpdateShazacinMetadataAdTracks(
    $input: UpdateShazacinMetadataAdTracksInput!
  ) {
    updateShazacinMetadataAdTracks(input: $input) {
      titleId
      trackId
      name
      narratedLanguage
      trackPosition
      narrator
      trackUrl
      publicEnabled
      magic_adjust
      releaseDate
      createdAt
    }
  }
`;

export const deleteShazacinMetadataAdTracks = /* GraphQL */ gql`
  mutation DeleteShazacinMetadataAdTracks(
    $input: DeleteShazacinMetadataAdTracksInput!
  ) {
    deleteShazacinMetadataAdTracks(input: $input) {
      titleId
      trackId
      name
      narratedLanguage
      trackPosition
      narrator
      trackUrl
      publicEnabled
      releaseDate
      createdAt
    }
  }
`;

export const createShazacinMetadataTitles = /* GraphQL */ gql`
  mutation CreateShazacinMetadataTitles(
    $input: CreateShazacinMetadataTitlesInput!
  ) {
    createShazacinMetadataTitles(input: $input) {
      createdAt
      updatedAt
      titleId
      categories
      actors
      directors
      genre
      previewUrl
      wheretowatch
      publicEnabled
      rated
      released
      runtimeMinutes
      score
      synopsis
      title
      type
      writers
      year
      fingerprinting_progress
      images
      parentId
      chapter
      episode
      season
    }
  }
`;

export const updateShazacinMetadataTitles = /* GraphQL */ gql`
  mutation UpdateShazacinMetadataTitles(
    $input: UpdateShazacinMetadataTitlesInput!
  ) {
    updateShazacinMetadataTitles(input: $input) {
      createdAt
      updatedAt
      titleId
      categories
      actors
      directors
      genre
      previewUrl
      wheretowatch
      publicEnabled
      rated
      released
      runtimeMinutes
      score
      synopsis
      title
      type
      writers
      year
      fingerprinting_progress
      images
      parentId
      chapter
      episode
      season
    }
  }
`;

export const deleteShazacinMetadataTitles = /* GraphQL */ gql`
  mutation DeleteShazacinMetadataTitles(
    $input: DeleteShazacinMetadataTitlesInput!
  ) {
    deleteShazacinMetadataTitles(input: $input) {
      createdAt
      updatedAt
      titleId
      categories
      actors
      directors
      genre
      previewUrl
      wheretowatch
      publicEnabled
      rated
      released
      runtimeMinutes
      score
      synopsis
      title
      type
      writers
      year
      fingerprinting_progress
      images
      parentId
      chapter
      episode
      season
    }
  }
`;

export const createShazacinUserNotifications = /* GraphQL */ gql`
  mutation CreateShazacinUserNotifications(
    $input: CreateShazacinUserNotificationsInput!
  ) {
    createShazacinUserNotifications(input: $input) {
      notificationId
      color
      createdAt
      heading
      icon
      imageUrl
      link
      message
      read_time
      title
      TTL
      userId
      adminId
    }
  }
`;

export const updateShazacinUserNotifications = /* GraphQL */ gql`
  mutation UpdateShazacinUserNotifications(
    $input: UpdateShazacinUserNotificationsInput!
  ) {
    updateShazacinUserNotifications(input: $input) {
      notificationId
      color
      createdAt
      heading
      icon
      imageUrl
      link
      message
      read_time
      title
      TTL
      userId
      adminId
    }
  }
`;

export const deleteShazacinUserNotifications = /* GraphQL */ gql`
  mutation DeleteShazacinUserNotifications(
    $input: DeleteShazacinUserNotificationsInput!
  ) {
    deleteShazacinUserNotifications(input: $input) {
      notificationId
      color
      createdAt
      heading
      icon
      imageUrl
      link
      message
      read_time
      title
      TTL
      userId
      adminId
    }
  }
`;
