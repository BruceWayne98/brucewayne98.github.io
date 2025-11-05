#!/bin/bash

# Hugo Site Export Script
# Creates a portable zip of your site (without dependencies)

EXPORT_NAME="hugo-site-$(date +%Y%m%d-%H%M%S).zip"

echo "📦 Creating portable Hugo site archive..."
echo "Export name: $EXPORT_NAME"
echo ""

# Create zip excluding unnecessary files
zip -r "$EXPORT_NAME" . \
  -x "*.git/*" \
  -x "*node_modules/*" \
  -x "*public/*" \
  -x "*resources/*" \
  -x "*.hugo_build.lock" \
  -x "*themes/hugo-noir/.git/*" \
  -x "*themes/hugo-noir/node_modules/*" \
  -x "*.DS_Store" \
  -x "*__pycache__/*" \
  -x "*.pyc"

echo ""
echo "✅ Export complete!"
echo "📁 File: $EXPORT_NAME"
echo ""
echo "To use on another system:"
echo "1. Extract the zip file"
echo "2. Run: git submodule update --init --recursive"
echo "3. Run: hugo server -D"
