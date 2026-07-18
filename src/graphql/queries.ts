function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
}

export const getShazacinMetadataAdTrack = /* GraphQL */ gql`
  query GetShazacinMetadataAdTrack($trackId: ID!) {
    getShazacinMetadataAdTrack(trackId: $trackId) {
      titleId
      trackId
      name
      narratedLanguage
      narrator
      trackUrl
      trackPosition
      magic_adjust
      publicEnabled
      releaseDate
      createdAt
    }
  }
`;

export const listShazacinMetadataAdTracks = /* GraphQL */ gql`
  query ListShazacinMetadataAdTracks(
    $filter: TableShazacinMetadataAdTracksFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinMetadataAdTracks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        titleId
        trackId
        name
        narratedLanguage
        trackPosition
        narrator
        trackUrl
        magic_adjust
        publicEnabled
        releaseDate
        createdAt
      }
      nextToken
    }
  }
`;

export const getShazacinMetadataTitle = /* GraphQL */ gql`
  query GetShazacinMetadataTitle($titleId: ID!) {
    getShazacinMetadataTitle(titleId: $titleId) {
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

export const listShazacinMetadataTitles = /* GraphQL */ gql`
  query ListShazacinMetadataTitles(
    $filter: TableShazacinMetadataTitlesFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinMetadataTitles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const getShazacinMetadataSubItemTitles = /* GraphQL */ gql`
  query GetShazacinMetadataSubItemTitles(
    $parentId: ID!
    $limit: Int
    $nextToken: String
  ) {
    getShazacinMetadataSubItemTitles(
      parentId: $parentId
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const getShazacinUserNotifications = /* GraphQL */ gql`
  query GetShazacinUserNotifications($notificationId: String!) {
    getShazacinUserNotifications(notificationId: $notificationId) {
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

export const listShazacinUserNotifications = /* GraphQL */ gql`
  query ListShazacinUserNotifications(
    $filter: TableShazacinUserNotificationsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinUserNotifications(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const listAdminUsers = /* GraphQL */ gql`
  query ListAdminUsers($poolId: ID) {
    listAdminUsers(poolId: $poolId) {
      status
      message
      totalUsers
      data {
        userId
        email
        email_verified
        name
        userCreateDate
        userLastModifiedDate
        enabled
        userStatus
      }
    }
  }
`;

export const listShazacinUserFeedbacks = /* GraphQL */ gql`
  query ListShazacinUserFeedbacks(
    $filter: TableShazacinUserFeedbackFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinUserFeedbacks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        feedbackId
        message
        email
        rating
        titleId
        createdAt
      }
      nextToken
    }
  }
`;
