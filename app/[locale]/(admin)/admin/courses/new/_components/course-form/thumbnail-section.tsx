import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";

/** Cover image upload. */
export function ThumbnailSection({ thumbnailUrl, handleImageUpload }: {
  thumbnailUrl: string;
  handleImageUpload: (url: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image de couverture</CardTitle>
        <CardDescription>
          Ajoutez une image attractive pour votre formation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ImageUpload
          onImageUploaded={handleImageUpload}
          currentImageUrl={thumbnailUrl}
          folder="courses"
          prefix="cover"
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
