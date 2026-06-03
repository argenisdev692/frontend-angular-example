declare namespace google {
  namespace maps {
    namespace places {
      interface AutocompleteOptions {
        types?: string[];
        fields?: string[];
      }
      class Autocomplete {
        constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: () => void): MapsEventListener;
        getPlace(): PlaceResult;
      }
      interface PlaceResult {
        formatted_address?: string;
        geometry?: {
          location?: {
            lat(): number;
            lng(): number;
          };
        };
      }
    }
    interface MapsEventListener {
      remove(): void;
    }
    namespace event {
      function removeListener(listener: MapsEventListener): void;
      function clearInstanceListeners(instance: object): void;
    }
  }
}
