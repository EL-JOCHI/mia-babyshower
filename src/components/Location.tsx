import { copy, shared } from '../content'

// Dónde (§3): the address and the map link. The words can be selected and copied,
// so a press on them does not move the camera.
export function Location() {
  return (
    <>
      <p className="place" data-no-drag>
        {shared.place}
      </p>
      <p className="city" data-no-drag>
        {shared.city}
      </p>
      <a className="button" href={shared.mapUrl} target="_blank" rel="noopener noreferrer">
        {copy.map}
      </a>
    </>
  )
}
