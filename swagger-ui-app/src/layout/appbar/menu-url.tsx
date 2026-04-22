import { DropdownItem, DropdownMenu } from "@/components/dropdown";
import { useUrls } from "@/hooks/schema";

export function MenuURL() {
  const { urls, setSelectedUrl } = useUrls();

  const handleChange = (url: string) => () => {
    setSelectedUrl(url);
  };

  return (
    <DropdownMenu>
      {urls.map((url) => (
        <DropdownItem key={url} onClick={handleChange(url)}>{url}</DropdownItem>
      ))}
    </DropdownMenu>
  );
}