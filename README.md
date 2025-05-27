# Instagram Videos Downloader

A modern and efficient Instagram video downloader that allows you to easily save reels and videos. Built with Next.js and featuring a clean, user-friendly interface.

## 🌟 Features

- Download Instagram videos and reels in high quality
- Clean, modern UI with dark mode support
- Fast and efficient downloading
- No registration required
- Mobile-friendly design
- API support for developers

## 🚀 Live Demo

Try it live: [Instagram Reels Downloader](https://instagram-reels-downloader-master-xm6a5vsbz.vercel.app)

## 🛠️ Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GINGKA-HAGANE-1/Instagram-reels-downloader.git
```

2. Install dependencies:
```bash
cd Instagram-reels-downloader
npm install
```

3. Create a `.env.local` file in the root directory (optional - for rate limiting):
```env
USE_UPSTASH="true"
UPSTASH_REDIS_REST_URL="YOUR-UPSTASH-URL"
UPSTASH_REDIS_REST_TOKEN="YOUR-UPSTASH-TOKEN"
```

### Development

Run the development server:
```bash
npm run dev
```

### Production

Build and start the production server:
```bash
npm run build
npm run start
```

## 🔌 API Usage

### Endpoint: `/api/video`

```http
GET /api/video?postUrl={POST_URL}
```

Parameters:
- `postUrl` (required): Instagram post or reel URL

Example Response:
```json
{
  "success": true,
  "data": {
    "url": "video_url_here",
    "thumbnail": "thumbnail_url_here"
  }
}
```

## ⚠️ Important Notes

- This tool is for personal use only
- Not affiliated with Instagram or Meta
- Use responsibly to avoid account restrictions
- Instagram Stories are not supported
- Rate limiting is implemented to prevent abuse

## 🔒 Rate Limiting

Rate limiting is implemented using Upstash Redis to ensure fair usage. To configure:

1. Create an account on [upstash.com](https://upstash.com/)
2. Set up a Redis database
3. Configure environment variables as shown in the installation section

Rate limit configurations can be found in `src/features/ratelimit/constants.ts`.

## 👨‍💻 Author

Created by Gingka Hagane (Monish)
- GitHub: [@GINGKA-HAGANE-1](https://github.com/GINGKA-HAGANE-1)

## 📄 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

Special thanks to the Next.js team and the open-source community for their amazing tools and libraries that made this project possible.
