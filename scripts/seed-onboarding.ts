/**
 * Seed onboarding movies - Curates ~200 highly recognizable movies for the onboarding swipe flow.
 * Movies are selected for high recognition rate, diverse genres, and spanning decades.
 *
 * Usage: npx tsx scripts/seed-onboarding.ts
 */

// These are stored as static data since they need to be carefully curated
// TMDB IDs for well-known movies across genres

export interface OnboardingMovie {
  tmdb_id: number
  title: string
  year: number
  poster_path: string
  genre_ids: number[]
}

// Genre IDs from TMDB
// 28=Action, 12=Adventure, 16=Animation, 35=Comedy, 80=Crime, 99=Documentary
// 18=Drama, 10751=Family, 14=Fantasy, 36=History, 27=Horror, 10402=Music
// 9648=Mystery, 10749=Romance, 878=Sci-Fi, 53=Thriller, 10752=War, 37=Western

export const ONBOARDING_MOVIES: OnboardingMovie[] = [
  // Action
  { tmdb_id: 603, title: "The Matrix", year: 1999, poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", genre_ids: [28, 878] },
  { tmdb_id: 155, title: "The Dark Knight", year: 2008, poster_path: "/qJ2tW6WMUDux911btUNKDL2SbJY.jpg", genre_ids: [28, 80, 18] },
  { tmdb_id: 24428, title: "The Avengers", year: 2012, poster_path: "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 245891, title: "John Wick", year: 2014, poster_path: "/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg", genre_ids: [28, 53] },
  { tmdb_id: 557, title: "Spider-Man", year: 2002, poster_path: "/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg", genre_ids: [28, 14] },
  { tmdb_id: 98, title: "Gladiator", year: 2000, poster_path: "/ty8TGRuvJLPUmAR1H1nRIsgCJaW.jpg", genre_ids: [28, 18, 12] },
  { tmdb_id: 140607, title: "Star Wars: The Force Awakens", year: 2015, poster_path: "/wqnFdCBJ2GCF75IiS3uolnDNWwg.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 27205, title: "Inception", year: 2010, poster_path: "/9gk7adHYeDvHkCSEhniVolaYcRg.jpg", genre_ids: [28, 878, 12] },
  { tmdb_id: 680, title: "Pulp Fiction", year: 1994, poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", genre_ids: [28, 80] },
  { tmdb_id: 550, title: "Fight Club", year: 1999, poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", genre_ids: [28, 18] },
  { tmdb_id: 76341, title: "Mad Max: Fury Road", year: 2015, poster_path: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 1726, title: "Iron Man", year: 2008, poster_path: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg", genre_ids: [28, 878, 12] },
  { tmdb_id: 11, title: "Star Wars", year: 1977, poster_path: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 118340, title: "Guardians of the Galaxy", year: 2014, poster_path: "/r7vmZjiyZw9rpJMQJp0Oz7VnM5.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 353486, title: "Jumanji: Welcome to the Jungle", year: 2017, poster_path: "/bXrZ5iHBEjH7WMidbUDQ0U2xbmr.jpg", genre_ids: [28, 12, 35] },

  // Comedy
  { tmdb_id: 620, title: "Ghostbusters", year: 1984, poster_path: "/3J7boOPZikzbE67Mpr0aQ7HYLZ1.jpg", genre_ids: [35, 14] },
  { tmdb_id: 694, title: "The Shining", year: 1980, poster_path: "/nRj5511mZdTl4HI5OciDIGEVh8h.jpg", genre_ids: [27, 53] },
  { tmdb_id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001, poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", genre_ids: [12, 14, 28] },
  { tmdb_id: 18785, title: "The Hangover", year: 2009, poster_path: "/uluhlXubGu1VxkAB7a52RjSLAIE.jpg", genre_ids: [35] },
  { tmdb_id: 109445, title: "Frozen", year: 2013, poster_path: "/kgwjIb2JDHRhNk13lmSMyujUIGQ.jpg", genre_ids: [16, 12, 35] },
  { tmdb_id: 508, title: "Mean Girls", year: 2004, poster_path: "/fXm3YKXAEjx7d2tQ8EiJJiYMR1.jpg", genre_ids: [35] },
  { tmdb_id: 4951, title: "10 Things I Hate About You", year: 1999, poster_path: "/ujERk3aKABXU3NDXLAxLMEaEPNE.jpg", genre_ids: [35, 10749] },
  { tmdb_id: 425, title: "Ice Age", year: 2002, poster_path: "/gLhHHZUzeseRXShoDyC4VqLgsNv.jpg", genre_ids: [16, 35, 12] },
  { tmdb_id: 8467, title: "Dumb and Dumber", year: 1994, poster_path: "/4LdpBXiCyGKkR8Fgbfusv9LlyrE.jpg", genre_ids: [35] },
  { tmdb_id: 22, title: "Pirates of the Caribbean: The Curse of the Black Pearl", year: 2003, poster_path: "/z8onk7LV9Mmw6zKz4CL1TF6MXhM.jpg", genre_ids: [12, 14, 28] },
  { tmdb_id: 107, title: "Snatch", year: 2000, poster_path: "/56mOJth6DJ2kBe4txlRXJniGMOq.jpg", genre_ids: [35, 80] },
  { tmdb_id: 137, title: "Groundhog Day", year: 1993, poster_path: "/gCgt1WARPdyFnnDe0Z2gqkKYMWS.jpg", genre_ids: [35, 14, 10749] },
  { tmdb_id: 11836, title: "The SpongeBob SquarePants Movie", year: 2004, poster_path: "/kFHEwJFPMGDST97QjytkN9O8JVe.jpg", genre_ids: [16, 35] },

  // Drama
  { tmdb_id: 278, title: "The Shawshank Redemption", year: 1994, poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", genre_ids: [18, 80] },
  { tmdb_id: 13, title: "Forrest Gump", year: 1994, poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", genre_ids: [18, 35, 10749] },
  { tmdb_id: 238, title: "The Godfather", year: 1972, poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", genre_ids: [18, 80] },
  { tmdb_id: 424, title: "Schindler's List", year: 1993, poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", genre_ids: [18, 36, 10752] },
  { tmdb_id: 14, title: "American Beauty", year: 1999, poster_path: "/wby1VdIRkfMfE3TGyMFGmkiJnVq.jpg", genre_ids: [18] },
  { tmdb_id: 389, title: "12 Angry Men", year: 1957, poster_path: "/ppd84D2i9W8jXmsyInGyihiSyqz.jpg", genre_ids: [18] },
  { tmdb_id: 497, title: "The Green Mile", year: 1999, poster_path: "/velWPhVMQeQKcxggNEU8YmIo52R.jpg", genre_ids: [18, 14, 80] },
  { tmdb_id: 334541, title: "Manchester by the Sea", year: 2016, poster_path: "/e8daDzP1d1gBo0VFtBGMMMVvjfh.jpg", genre_ids: [18] },
  { tmdb_id: 453, title: "A Beautiful Mind", year: 2001, poster_path: "/zwzWCmH72OSC9NA0ipoqw5Zjya.jpg", genre_ids: [18, 10749] },
  { tmdb_id: 807, title: "Se7en", year: 1995, poster_path: "/6yoghtyTpznpBik8EngEmJskVUO.jpg", genre_ids: [80, 9648, 53] },
  { tmdb_id: 77, title: "Memento", year: 2000, poster_path: "/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg", genre_ids: [9648, 53] },
  { tmdb_id: 637, title: "Life Is Beautiful", year: 1997, poster_path: "/74hLDKjD5aGYOotO6esUVaeISa2.jpg", genre_ids: [35, 18] },

  // Horror
  { tmdb_id: 694, title: "The Shining", year: 1980, poster_path: "/nRj5511mZdTl4HI5OciDIGEVh8h.jpg", genre_ids: [27, 53] },
  { tmdb_id: 346364, title: "It", year: 2017, poster_path: "/9E2y5Q7WlCVNEhP5GiVTjhEhx1o.jpg", genre_ids: [27, 53] },
  { tmdb_id: 493922, title: "Hereditary", year: 2018, poster_path: "/lHV8HHlhwNMo2UbFnOVA2klJ3EY.jpg", genre_ids: [27, 9648, 53] },
  { tmdb_id: 419430, title: "Get Out", year: 2017, poster_path: "/tFXcEccSQMf3zy7uCiqnBkF2AEM.jpg", genre_ids: [27, 9648, 53] },
  { tmdb_id: 539, title: "Psycho", year: 1960, poster_path: "/yz4QVqPx3h1hD1DfqqQkCq3rmxW.jpg", genre_ids: [27, 53] },
  { tmdb_id: 377, title: "A Nightmare on Elm Street", year: 1984, poster_path: "/wGTpGGRMZmyFCcrY2YoxVTIBlli.jpg", genre_ids: [27] },
  { tmdb_id: 565, title: "The Ring", year: 2002, poster_path: "/iy5amqO5k7VqKYDNZkHi1AvH5F9.jpg", genre_ids: [27, 9648] },
  { tmdb_id: 310131, title: "The Witch", year: 2015, poster_path: "/zLfgUYbJPvFjGMrv7fUVxjGMZiQ.jpg", genre_ids: [27, 18] },
  { tmdb_id: 396535, title: "Train to Busan", year: 2016, poster_path: "/1WNjhBvTOadOJfipFNnMcFfMknt.jpg", genre_ids: [27, 28, 53] },
  { tmdb_id: 747, title: "Shaun of the Dead", year: 2004, poster_path: "/lzSLFGmgjJBhclbFtqau6m3l1i4.jpg", genre_ids: [27, 35] },

  // Sci-Fi
  { tmdb_id: 157336, title: "Interstellar", year: 2014, poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", genre_ids: [878, 18, 12] },
  { tmdb_id: 335984, title: "Blade Runner 2049", year: 2017, poster_path: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", genre_ids: [878, 18] },
  { tmdb_id: 348, title: "Alien", year: 1979, poster_path: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", genre_ids: [878, 27] },
  { tmdb_id: 329865, title: "Arrival", year: 2016, poster_path: "/x2FJsf1ElAgr63Y3LNxZq68G3j3.jpg", genre_ids: [878, 18, 9648] },
  { tmdb_id: 264660, title: "Ex Machina", year: 2014, poster_path: "/bB4SdkhF3JMw8LAPCV8Lmf5NIXI.jpg", genre_ids: [878, 18, 53] },
  { tmdb_id: 62, title: "2001: A Space Odyssey", year: 1968, poster_path: "/ve72VilhG6pOpINYSm4o4beWBEP.jpg", genre_ids: [878, 9648, 12] },
  { tmdb_id: 19995, title: "Avatar", year: 2009, poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", genre_ids: [878, 28, 12] },
  { tmdb_id: 218, title: "The Terminator", year: 1984, poster_path: "/qvktm0BHcnmDpul4Hz01GlazGok.jpg", genre_ids: [878, 28, 53] },
  { tmdb_id: 607, title: "Men in Black", year: 1997, poster_path: "/uLOmOF5IzWoyrgIF5MfUnh5pa1X.jpg", genre_ids: [878, 35, 12] },
  { tmdb_id: 68718, title: "Django Unchained", year: 2012, poster_path: "/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg", genre_ids: [18, 37] },

  // Romance
  { tmdb_id: 597, title: "Titanic", year: 1997, poster_path: "/9xjZS2rlVxm8SFx8kFB3985DJiT.jpg", genre_ids: [18, 10749] },
  { tmdb_id: 152601, title: "Her", year: 2013, poster_path: "/yk4J4aewWYNiBhD49RM66eRFBJi.jpg", genre_ids: [10749, 878, 18] },
  { tmdb_id: 128, title: "Princess Bride", year: 1987, poster_path: "/dvjqlp2sAhUikh74pSbFVJbNjbF.jpg", genre_ids: [12, 10751, 35, 10749, 14] },
  { tmdb_id: 11036, title: "The Notebook", year: 2004, poster_path: "/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg", genre_ids: [10749, 18] },
  { tmdb_id: 313369, title: "La La Land", year: 2016, poster_path: "/uDO8zWDhfWwoFdKRhcorjYRVGhU.jpg", genre_ids: [10749, 18, 35] },
  { tmdb_id: 4348, title: "Pride & Prejudice", year: 2005, poster_path: "/qOEJSq6pwGVIFNZkH2IKJiTqFoE.jpg", genre_ids: [10749, 18] },
  { tmdb_id: 222935, title: "The Fault in Our Stars", year: 2014, poster_path: "/4Vrf00Frs37TOTyBj2NOhBb0EcQ.jpg", genre_ids: [10749, 18] },
  { tmdb_id: 508442, title: "Soul", year: 2020, poster_path: "/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg", genre_ids: [16, 35, 18] },

  // Thriller
  { tmdb_id: 745, title: "The Sixth Sense", year: 1999, poster_path: "/fIssD3w3SvIhPPmVo4WMgZDVLID.jpg", genre_ids: [18, 9648, 53] },
  { tmdb_id: 274, title: "The Silence of the Lambs", year: 1991, poster_path: "/rplLJ2hPcOQmkFhTqUte0MkEb9a.jpg", genre_ids: [80, 18, 53] },
  { tmdb_id: 68721, title: "Gone Girl", year: 2014, poster_path: "/lv5xShBIDPe4I69xiMfM8KtIh1Y.jpg", genre_ids: [18, 9648, 53] },
  { tmdb_id: 500, title: "Reservoir Dogs", year: 1992, poster_path: "/xi8Iu6qyTfyZVDVy60raIOYJJmk.jpg", genre_ids: [80, 53] },
  { tmdb_id: 475557, title: "Joker", year: 2019, poster_path: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg", genre_ids: [80, 18, 53] },
  { tmdb_id: 381288, title: "Split", year: 2016, poster_path: "/rXMWOZiCt6eMX22jWuTOSdQ98bY.jpg", genre_ids: [27, 53] },
  { tmdb_id: 398818, title: "Call Me by Your Name", year: 2017, poster_path: "/nPTjj6ZfBXXBRKIIHxdpRjKnRPq.jpg", genre_ids: [10749, 18] },
  { tmdb_id: 490132, title: "Green Book", year: 2018, poster_path: "/7BsvSuDQuoqhWmU2fL7W2GOcZHU.jpg", genre_ids: [18, 35] },

  // Animation
  { tmdb_id: 862, title: "Toy Story", year: 1995, poster_path: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", genre_ids: [16, 35, 10751] },
  { tmdb_id: 150540, title: "Inside Out", year: 2015, poster_path: "/2H1TmgdfNtsKlU9osGFOjCi5eMo.jpg", genre_ids: [16, 35, 18] },
  { tmdb_id: 12, title: "Finding Nemo", year: 2003, poster_path: "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg", genre_ids: [16, 10751] },
  { tmdb_id: 129, title: "Spirited Away", year: 2001, poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", genre_ids: [16, 10751, 14] },
  { tmdb_id: 38757, title: "Tangled", year: 2010, poster_path: "/ym7T4dZBFiJNjwv8jUfNn1mPeQx.jpg", genre_ids: [16, 35, 10751] },
  { tmdb_id: 354912, title: "Coco", year: 2017, poster_path: "/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg", genre_ids: [16, 10751, 14] },
  { tmdb_id: 10681, title: "WALL-E", year: 2008, poster_path: "/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg", genre_ids: [16, 10751, 878] },
  { tmdb_id: 585, title: "Monsters, Inc.", year: 2001, poster_path: "/sgheSKxZkttIe8ONsf2sEpMSBOB.jpg", genre_ids: [16, 35, 10751] },
  { tmdb_id: 920, title: "Cars", year: 2006, poster_path: "/qa6HCwP4Z15l3hpsASz3auugBr6.jpg", genre_ids: [16, 12, 35] },
  { tmdb_id: 508943, title: "Luca", year: 2021, poster_path: "/jTswp6KyDYKtvC52GbHagrZbGvD.jpg", genre_ids: [16, 35, 14] },

  // Documentary
  { tmdb_id: 4553, title: "An Inconvenient Truth", year: 2006, poster_path: "/sTa2QX9GDKwO6mX0oo3pqoIQgfS.jpg", genre_ids: [99] },
  { tmdb_id: 42251, title: "Senna", year: 2010, poster_path: "/q3qqUVKL2EfHJx2ySVVtXxdENJH.jpg", genre_ids: [99] },
  { tmdb_id: 14160, title: "March of the Penguins", year: 2005, poster_path: "/dYwEGBuQ3Y4JIibqeJeBPKpVOAK.jpg", genre_ids: [99] },
  { tmdb_id: 333667, title: "13th", year: 2016, poster_path: "/jAuBmPnB8kAjojmjD3jEBxuXRrk.jpg", genre_ids: [99] },

  // Mystery
  { tmdb_id: 546554, title: "Knives Out", year: 2019, poster_path: "/pThyQovXQrw2m0s9x82twj48Jq4.jpg", genre_ids: [35, 80, 9648] },
  { tmdb_id: 16869, title: "Inglourious Basterds", year: 2009, poster_path: "/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg", genre_ids: [18, 53, 10752] },
  { tmdb_id: 459003, title: "Parasite", year: 2019, poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", genre_ids: [35, 18, 53] },
  { tmdb_id: 500844, title: "1917", year: 2019, poster_path: "/iZf0KyrE25z1sage4SYFLCCrMi9.jpg", genre_ids: [18, 36, 10752] },
  { tmdb_id: 496243, title: "Parasite", year: 2019, poster_path: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", genre_ids: [35, 18, 53] },

  // Fantasy
  { tmdb_id: 671, title: "Harry Potter and the Philosopher's Stone", year: 2001, poster_path: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg", genre_ids: [12, 14] },
  { tmdb_id: 122, title: "The Lord of the Rings: The Return of the King", year: 2003, poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", genre_ids: [12, 14, 28] },
  { tmdb_id: 121, title: "The Lord of the Rings: The Two Towers", year: 2002, poster_path: "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg", genre_ids: [12, 14, 28] },
  { tmdb_id: 10193, title: "Toy Story 3", year: 2010, poster_path: "/mMltbSxwEdNE4Cv8QYLpzkHWTDo.jpg", genre_ids: [16, 35, 10751] },
  { tmdb_id: 674, title: "Harry Potter and the Goblet of Fire", year: 2005, poster_path: "/fEZpFDpJA2NYqf7cHNYBVCF1hZe.jpg", genre_ids: [12, 14] },

  // War
  { tmdb_id: 857, title: "Saving Private Ryan", year: 1998, poster_path: "/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg", genre_ids: [18, 36, 10752] },
  { tmdb_id: 520763, title: "A Quiet Place Part II", year: 2020, poster_path: "/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg", genre_ids: [27, 878, 53] },

  // Western
  { tmdb_id: 429, title: "The Good, the Bad and the Ugly", year: 1966, poster_path: "/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg", genre_ids: [37] },

  // International / Foreign
  { tmdb_id: 284053, title: "Thor: Ragnarok", year: 2017, poster_path: "/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg", genre_ids: [28, 12, 35] },
  { tmdb_id: 372058, title: "Your Name.", year: 2016, poster_path: "/q719jXXEzOoYaps6aYY7Y714AVe.jpg", genre_ids: [16, 18, 10749] },
  { tmdb_id: 346, title: "Seven Samurai", year: 1954, poster_path: "/8OKmBV5BUFzmozIC3pColi4I0rl.jpg", genre_ids: [28, 18] },
  { tmdb_id: 664, title: "Twister", year: 1996, poster_path: "/xPMCol5Cz15ZY7lCFnpJPOXmkIF.jpg", genre_ids: [28, 12, 53] },

  // More diverse picks
  { tmdb_id: 37724, title: "Skyfall", year: 2012, poster_path: "/lfMmR1lf5bS1J09O1WQjfPn47w9.jpg", genre_ids: [28, 12, 53] },
  { tmdb_id: 324857, title: "Spider-Man: Into the Spider-Verse", year: 2018, poster_path: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", genre_ids: [16, 28, 12] },
  { tmdb_id: 603692, title: "John Wick: Chapter 4", year: 2023, poster_path: "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg", genre_ids: [28, 53, 80] },
  { tmdb_id: 533535, title: "Deadpool & Wolverine", year: 2024, poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", genre_ids: [28, 35, 878] },
  { tmdb_id: 299536, title: "Avengers: Infinity War", year: 2018, poster_path: "/7WsyChQLEftFiDhRhUg3IXckePv.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 438631, title: "Dune", year: 2021, poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", genre_ids: [878, 12] },
  { tmdb_id: 346698, title: "Barbie", year: 2023, poster_path: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", genre_ids: [35, 12, 14] },
  { tmdb_id: 569094, title: "Spider-Man: Across the Spider-Verse", year: 2023, poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", genre_ids: [16, 28, 12] },
  { tmdb_id: 572802, title: "Aquaman and the Lost Kingdom", year: 2023, poster_path: "/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg", genre_ids: [28, 14, 12] },
  { tmdb_id: 466420, title: "Killers of the Flower Moon", year: 2023, poster_path: "/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg", genre_ids: [80, 18, 36] },
  { tmdb_id: 872585, title: "Oppenheimer", year: 2023, poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", genre_ids: [18, 36] },
  { tmdb_id: 614930, title: "Teenage Mutant Ninja Turtles: Mutant Mayhem", year: 2023, poster_path: "/ueO9MYIOHO7M1PiMUeX74uf8fB9.jpg", genre_ids: [16, 28, 35] },
  { tmdb_id: 385687, title: "Fast X", year: 2023, poster_path: "/fiVW06jE7z9YnO4trhaNFQ8HR8.jpg", genre_ids: [28, 80, 53] },
  { tmdb_id: 447365, title: "Guardians of the Galaxy Vol. 3", year: 2023, poster_path: "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg", genre_ids: [878, 12, 28] },
  { tmdb_id: 502356, title: "The Super Mario Bros. Movie", year: 2023, poster_path: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg", genre_ids: [16, 12, 10751] },

  // Classic must-sees
  { tmdb_id: 240, title: "The Godfather Part II", year: 1974, poster_path: "/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg", genre_ids: [18, 80] },
  { tmdb_id: 769, title: "GoodFellas", year: 1990, poster_path: "/aKuFiU82s5ISJDx8cIIJwFgflgF.jpg", genre_ids: [18, 80] },
  { tmdb_id: 73, title: "American History X", year: 1998, poster_path: "/euypWkaYFOLRJGFLXIwES3IFxIF.jpg", genre_ids: [18] },
  { tmdb_id: 578, title: "Jaws", year: 1975, poster_path: "/lxM6kqilAdpdhqUl2biYp5frUxE.jpg", genre_ids: [12, 27] },
  { tmdb_id: 600, title: "Full Metal Jacket", year: 1987, poster_path: "/kMKyx1k8hWWscYFnPbnxxYkip1Z.jpg", genre_ids: [18, 10752] },
  { tmdb_id: 489, title: "Good Will Hunting", year: 1997, poster_path: "/bABCBKYBK7A5G1x0FzmFfm96SOo.jpg", genre_ids: [18, 10749] },
  { tmdb_id: 510, title: "One Flew Over the Cuckoo's Nest", year: 1975, poster_path: "/3jcbDmRFiQ83drXNOvRDeKHxS0C.jpg", genre_ids: [18] },
  { tmdb_id: 18491, title: "Neon Genesis Evangelion: The End of Evangelion", year: 1997, poster_path: "/hs9G0YdNjXJJoMzg33GFQJGTJ13.jpg", genre_ids: [16, 878, 18] },
  { tmdb_id: 568, title: "Apollo 13", year: 1995, poster_path: "/gLMzRGIyaZYNKJFOJhIVqBDcMeN.jpg", genre_ids: [18, 12, 36] },
  { tmdb_id: 599, title: "Braveheart", year: 1995, poster_path: "/or1WTEYkPWZSReIwY9qt2qQ0Pby.jpg", genre_ids: [28, 18, 36] },

  // 2020s additions
  { tmdb_id: 634649, title: "Spider-Man: No Way Home", year: 2021, poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 361743, title: "Top Gun: Maverick", year: 2022, poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg", genre_ids: [28, 18] },
  { tmdb_id: 505642, title: "Black Panther: Wakanda Forever", year: 2022, poster_path: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 414906, title: "The Batman", year: 2022, poster_path: "/74xTEgt7R36Fpooo50r9T25onhq.jpg", genre_ids: [80, 9648, 53] },
  { tmdb_id: 436270, title: "Black Adam", year: 2022, poster_path: "/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg", genre_ids: [28, 14, 878] },
  { tmdb_id: 785084, title: "The Menu", year: 2022, poster_path: "/v31MsWhF9WFh7Qo09IvYMBtAXCz.jpg", genre_ids: [35, 27, 53] },
  { tmdb_id: 614479, title: "Everything Everywhere All at Once", year: 2022, poster_path: "/w3LxiVQoay403rK4BYBME5oLvKx.jpg", genre_ids: [28, 12, 878] },
  { tmdb_id: 536554, title: "M3GAN", year: 2022, poster_path: "/d9nBoowhjiiYc4FBNtQkPY7c11H.jpg", genre_ids: [27, 878, 53] },
]

// Helper to get movies for specific genres
export function getOnboardingMoviesForGenres(selectedGenreIds: number[], count: number = 30): OnboardingMovie[] {
  // 70% from selected genres, 30% diverse
  const genreCount = Math.floor(count * 0.7)
  const diverseCount = count - genreCount

  // Movies matching selected genres
  const genreMovies = ONBOARDING_MOVIES.filter(m =>
    m.genre_ids.some(g => selectedGenreIds.includes(g))
  )

  // Shuffle and pick
  const shuffled = [...genreMovies].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, genreCount)

  // Diverse movies (not matching selected genres as primary)
  const diverseMovies = ONBOARDING_MOVIES.filter(m =>
    !selected.includes(m) && !m.genre_ids.some(g => selectedGenreIds.includes(g))
  ).sort(() => Math.random() - 0.5).slice(0, diverseCount)

  // If we don't have enough diverse, fill from remaining genre movies
  const remaining = shuffled.slice(genreCount).slice(0, diverseCount - diverseMovies.length)

  return [...selected, ...diverseMovies, ...remaining].slice(0, count)
}

// Unique deduplicated list
export function getUniqueOnboardingMovies(): OnboardingMovie[] {
  const seen = new Set<number>()
  return ONBOARDING_MOVIES.filter(m => {
    if (seen.has(m.tmdb_id)) return false
    seen.add(m.tmdb_id)
    return true
  })
}

console.log(`Onboarding movie set: ${getUniqueOnboardingMovies().length} unique movies`)
console.log('Ready for use in the onboarding swipe flow.')
