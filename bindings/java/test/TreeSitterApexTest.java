import io.github.treesitter.jtreesitter.Language;
import io.github.treesitter.jtreesitter.apex.TreeSitterApex;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class TreeSitterApexTest {
    @Test
    public void testCanLoadLanguage() {
        assertDoesNotThrow(() -> new Language(TreeSitterApex.language()));
    }
}
