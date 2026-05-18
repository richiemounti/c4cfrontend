#!/bin/bash

# Script to create the instructional videos directory structure
# Run this from your project root directory

echo "Creating instructional videos directory structure..."

# Base directory
BASE_DIR="public/videos/instructional"

# Create main directory
mkdir -p "$BASE_DIR"

# Create subdirectories for each module
directories=(
  "project-setup"
  "organization-setup"
  "survey-builder"
  "stakeholder-mapping"
  "theory-of-change"
  "risk-register"
  "reporting"
  "dashboard"
  "data-collection"
  "review-process"
  "gdpr-compliance"
  "general"
)

for dir in "${directories[@]}"; do
  mkdir -p "$BASE_DIR/$dir"
  echo "Created: $BASE_DIR/$dir"
done

# Create placeholder README in each directory
for dir in "${directories[@]}"; do
  cat > "$BASE_DIR/$dir/README.md" << EOF
# ${dir^} Video Directory

Place instructional videos for ${dir} module here.

## Expected Files

- \`*.mp4\` - Video files
- \`*-poster.jpg\` - Poster/thumbnail images for videos

## Naming Convention

Video: \`descriptive-name.mp4\`
Poster: \`descriptive-name-poster.jpg\`

## Notes

- Keep videos under 50MB when possible
- Use 720p or 1080p resolution
- Include poster images for better UX
EOF
  echo "Created README in: $BASE_DIR/$dir"
done

# Create a .gitkeep file in the base directory to ensure it's tracked by git
touch "$BASE_DIR/.gitkeep"

echo ""
echo "✅ Video directory structure created successfully!"
echo ""
echo "Directory structure:"
echo "$BASE_DIR/"
for dir in "${directories[@]}"; do
  echo "  ├── $dir/"
done
echo ""
echo "Next steps:"
echo "1. Add your video files to the appropriate directories"
echo "2. Create poster images for each video (recommended)"
echo "3. Reference videos in your components using: /videos/instructional/{module}/{filename}.mp4"
echo ""