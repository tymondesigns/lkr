/**
 * Serialize and Unserialize data
 *
 * @author Sean Tymon <tymon148@gmail.com>
 */
class JSONSerializer {

    /**
     * Serialize the provided data.
     *
     * @param   {Mixed}  data  The data to serialize
     *
     * @return  {String}
     */
    static serialize (data) {
        try {
            return JSON.stringify(data);
        } catch (e) {
            return data;
        }
    }

    /**
     * Unserialize the provided data.
     *
     * @param   {String}  payload  The payload to unserialize
     *
     * @return  {Mixed}
     */
    static unserialize (payload) {
        try {
            return JSON.parse(payload);
        } catch (e) {
            return payload;
        }
    }

}

export default JSONSerializer;
