# File Tree: music_app

```
├── 📁 backend
│   ├── 📁 config
│   │   ├── 📄 cloudinary.js
│   │   └── 📄 db.js   
│   ├── 📁 controllers
│   │   ├── 📄 artistController.js
│   │   ├── 📄 chatbotController.js
│   │   ├── 📄 commentController.js
│   │   ├── 📄 playlistController.js
│   │   ├── 📄 searchController.js
│   │   ├── 📄 settingController.js
│   │   ├── 📄 songController.js
│   │   ├── 📄 statsController.js
│   │   └── 📄 userController.js
│   ├── 📁 middleware
│   │   ├── 📄 authMiddleware.js
│   │   └── 📄 uploads.js
│   ├── 📁 routes
│   │   ├── 📄 artistRoutes.js
│   │   ├── 📄 chatbotRoutes.js
│   │   ├── 📄 commentRoutes.js
│   │   ├── 📄 playlistRoutes.js
│   │   ├── 📄 searchRoutes.js
│   │   ├── 📄 settingRoutes.js
│   │   ├── 📄 songRoutes.js
│   │   ├── 📄 statsRoutes.js
│   │   └── 📄 userRoutes.js
│   ├── 📁 scripts
│   │   └── 📄 importSpotifyData.js
│   ├── 📁 carts
│   │   ├── 📁 artists
│   │   ├── 📁 avatars
│   │   ├── 📁 images
│   │   ├── 📁 lyrics
│   │   ├── 📁 songs
│   │   └── 📁 thumbnails
│   ├── 📁 utils
│   │   └── 📄 spotifyToken.js
│   ├── 📄 server.js
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   └── 📄 .env
├── 📁 frontend
│   ├── 📁 public
│   ├── 📁 src
│   │   ├── 📁 api
│   │   │   └── 📄 api.js
│   │   ├── 📁 assets
│   │   │   ├── 📁 fonts
│   │   │   │   ├── 📄 Genos-Black.ttf
│   │   │   │   └── 📄 Genos-Light.ttf
│   │   │   ├── 📁 icon
│   │   │   │   └── 📄 listen-1.png
│   │   │   └── 📁 images
│   │   ├── 📁 components
│   │   │   ├── 📁 common
│   │   │   │   └── 📄 LyricsViewer.js
│   │   │   ├── 📁 forms
│   │   │   │   ├── 📄 ArtistForm.js
│   │   │   │   ├── 📄 EditPlaylistModal.js
│   │   │   │   ├── 📄 PlaylistForm.js
│   │   │   │   ├── 📄 ProfileForm.js
│   │   │   │   └── 📄 SongForm.js
│   │   │   ├── 📁 layout
│   │   │   │   ├── 📄 AudioPlayer.js
│   │   │   │   ├── 📄 Footer.js
│   │   │   │   ├── 📄 FullScreenPlayer.js
│   │   │   │   ├── 📄 Navigation.js
│   │   │   │   └── 📄 SongDetails.js
│   │   │   ├── 📁 modals
│   │   │   │   ├── 📄 AddToPlaylistModal.js
│   │   │   │   ├── 📄 AlbumDetailModal.js
│   │   │   │   ├── 📄 ArtistDetailModal.js
│   │   │   │   ├── 📄 ChatbotModal.js
│   │   │   │   ├── 📄 SongInforModal.js
│   │   │   │   └── 📄 UserDetailsModal.js
│   │   │   └── 📁 ui
│   │   │       ├── 📄 Button.js
│   │   │       ├── 📄 CommentSection.js
│   │   │       ├── 📄 HeroSection.js
│   │   │       ├── 📄 index.js
│   │   │       ├── 📄 MusicPlayer.js
│   │   │       ├── 📄 PlayPauseButton.js
│   │   │       ├── 📄 Slider.js
│   │   │       └── 📄 SongCard.js
│   │   ├── 📁 context
│   │   │   ├── 📄 AudioContext.js
│   │   │   ├── 📄 AuthContext.js
│   │   │   └── 📄 SongContext.js
│   │   ├── 📁 pages
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📄 AdminArtistPage.js
│   │   │   │   ├── 📄 AdminDashboard.js
│   │   │   │   ├── 📄 AdminGenrePage.js
│   │   │   │   ├── 📄 AdminLayout.js
│   │   │   │   ├── 📄 AdminOverview.js
│   │   │   │   ├── 📄 AdminSongPage.js
│   │   │   │   ├── 📄 AdminUserPage.js
│   │   │   │   └── 📄 ManageContentHome.js
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 LoginPage.js
│   │   │   │   ├── 📄 RegisterPage.js
│   │   │   │   └── 📄 ResetPasswordPage.jsx
│   │   │   └── 📁 main
│   │   │       ├── 📄 AlbumPage.js
│   │   │       ├── 📄 ArtistPage.js
│   │   │       ├── 📄 CountryPage.js
│   │   │       ├── 📄 GenresPage.js
│   │   │       ├── 📄 HistoryPage.js
│   │   │       ├── 📄 HomeSongPage.js
│   │   │       ├── 📄 MainLayout.js
│   │   │       ├── 📄 PlaylistPage.js
│   │   │       ├── 📄 ProfilePage.js
│   │   │       └── 📄 SearchPage.js
│   │   ├── 📁 styles
│   │   │   ├── 📄 App.css
│   │   │   └── 📄 index.css
│   │   ├── 📄 App.js
│   │   ├── 📄 App.test.js
│   │   ├── 📄 index.js
│   │   ├── 📄 logo.svg
│   │   ├── 📄 reportWebVitals.js
│   │   └── 📄 setupTests.js
│   ├── 📄 .env
│   ├── 📄 .gitignore
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   ├── 📄 postcss.config.js
│   ├── 📄 tailwind.config.js
│   └── 📄 README.md
├── 📄 README.md
└── 📄 .gitignore
